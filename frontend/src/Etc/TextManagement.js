import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model' ;
import {LogError} from './ErrorHandler';
const nlp  = winkNLP( model )

const CLIPSIZE = 3;
const MAXCLIPSPERSLIDE = 10;

//Updates the display slide text.  Should this be moved to the server and fired when needed from there?
export function UpdateSlideText(slide)
{
    const clips = slide.Clips;
    const sentences = clips.map(clip => clip.ClipText);
    const newSlide = {...slide, SlideText: sentences.join(' ')};
    return newSlide;
}

//Async gets the slide from the server, updates the text based on existing clips, and pushes the changes.
export async function UpdateSlideTextOnServer(APICalls, slideID) {
    try {
        const results = await APICalls.GetSlideDetails(slideID);
        const slide = results[0]
        const newSlide = UpdateSlideText(slide);
        await APICalls.UpdateSlide(newSlide);
        return true;
    }
    catch (err)
    {
        console.log('Error in UpdateSlideTextOnServer')
        console.log(err);
    }
    return false
}

//Imports a slide text file, creates 1-many slides and returns a promise that resolves with the first slide
export async function ImportNewSlideText(chapterID, defaultSlideName, defaultVoiceID, text, APICalls, ordinalValue = 1)
{

    let dom = "";
    try {
        let xmlText = "<document>" + text.replace(/”/g, '"')
                                    .replace(/[\u2018\u2019]/g, "'") //This is replacing the problematic quote marks from Word docs
                                    .replace(/[\u201C\u201D]/g, '"') 
                                    + "</document>"
        let parser = new DOMParser();
        dom = parser.parseFromString(xmlText, "text/xml");
        const errorNode = dom.querySelector('parsererror');
        if (errorNode) {
            console.log("Error parsing Slide Text");
            console.log(errorNode)
            console.log(dom);
            alert("Can't parse slide, incorrect format")
            return;
        } 
        let slides = dom.getElementsByTagName('Slide');
        if (slides.length === 0 )
        {
            const clipObjs = parseSlideElement(dom, defaultVoiceID);
            // There are no slide labels, this is all one slide
            const promise = new Promise((resolve, reject) => {
                CreateSlides(chapterID, defaultSlideName, defaultVoiceID, clipObjs, APICalls, ordinalValue++).then(values => resolve(values[0]));
            });
        
            return promise
        }
        else
        {
            //multiple slides found
            // Wrap this in a promise.all(), but only resolve as the first one
            var promiseArray = [];
            Array.from(slides).forEach(slide => {              
                let name = slide.getAttribute('name') || slide.getAttribute('Name') || defaultSlideName;
                let voiceID = parseInt(slide.getAttribute('voiceid')) || parseInt(slide.getAttribute('VoiceID')) || defaultVoiceID;
                const clipObjs = parseSlideElement(slide, voiceID)
                promiseArray.push( new Promise((resolve, reject) => {
                    CreateSlides(chapterID, name, voiceID, clipObjs, APICalls, ordinalValue)
                        .then(values => {resolve(values[0])});
                }));
                ordinalValue += Math.ceil(clipObjs.length / MAXCLIPSPERSLIDE);
            });
            return new Promise((resolve, reject) => {
                Promise.all(promiseArray).then(values => resolve(values[0]))
            });
        }
    }
    catch (err) {
        //Broke doc
        LogError(err);
    }
    
}


//Breaks down a single block of text into slides.
export async function CreateSlides(chapterID, defaultSlideName, defaultSlideVoiceID,clipObjs, APICalls, ordinalValue)
{
        //<Voice VoiceID="1"></Voice>
        //Start by splitting on voices.
    
    const minNumSlides = Math.ceil(clipObjs.length / MAXCLIPSPERSLIDE); //This could be 1
    const avgSize = Math.ceil(clipObjs.length / minNumSlides); //Support for not creating 
    let promiseArray = [];
    for (let i = 0; i < minNumSlides; i++)
    {
        const clipObjsForSlide = clipObjs.slice(i*avgSize,((i+1) * avgSize));
        const slideName = defaultSlideName + (i>0 ? "-"+(i+1) : "");
        const subSlide = CreateSlide(chapterID, slideName, defaultSlideVoiceID, clipObjsForSlide, APICalls, ordinalValue);
        ordinalValue += clipObjsForSlide.length;
        promiseArray.push(subSlide);
    }
    return new Promise((resolve, reject) => {
        //Promise.all(promiseArray).then(values => resolve(values));
        Promise.all(promiseArray).then(values => {
            resolve(values)
        });
    });
}

//Processes a single slide's worth of clips.
//text is [{text: clip text, voiceID: voice ID for clip}]
export function CreateSlide(chapterID, slideName, slideVoice, clipObjs, APICalls, ordinalValue)
{
    if (clipObjs.length < 1 || clipObjs.length > MAXCLIPSPERSLIDE)
    {
        alert( 'invalid CreateSlide Call.  Text length = ' + clipObjs.length + '. Aborting');
    }
    const promise = new Promise((resolve, reject) => {
    
    APICalls.CreateSlide({ChapterID:chapterID, SlideName:slideName, DefaultVoice:slideVoice , 
            lideText: clipObjs.map(clip => clip.text).join(" "), OrdinalValue: ordinalValue}).then(slide => {

        if (slide.ID == null) {
            alert(`Invalid slide creation.  Aborting`);
            return;
        }
        try {
            var promiseArray = [];
            let clipOrdinalValue = 1

            Array.from(clipObjs).forEach(clipTextObj => {
                const promise = new Promise((resolve, reject) => {
                    const clip = {SlideID:slide.ID, ClipText:clipTextObj.text, VoiceID: clipTextObj.voiceID, OrdinalValue: clipOrdinalValue++}                
                    
                    APICalls.CreateClip(clip,clipTextObj.voiceID).then(async newClip=>{
                        resolve()
                    })
                })
                promiseArray.push(promise);
                
            })
            Promise.all(promiseArray).then(()=>resolve(slide));
            
        }
        catch (err) {
            console.log('Shouldnt be here');
            LogError(err);

        }})
    });
    

    return promise
}

//Parse out information inside a give <Slide> element, including voice information.
//Return a list of clip objects : [{text: , voiceID: }]
export function parseSlideElement(slideDom, defaultSlideVoiceID)
{
    var clipObjs = [];
    var documentDom = slideDom.getElementsByTagName('document');
    if (documentDom.length === 0)
    {
        //no actual slides
        clipObjs.push(...SplitTextIntoClipText(documentDom[0].textContent, defaultSlideVoiceID));
    }
    else if (slideDom.getElementsByTagName('Voice').length === 0 )
    {
        // There are no voice labels, so this is all one voice
        clipObjs.push(...SplitTextIntoClipText(slideDom.textContent, defaultSlideVoiceID));
    }
    else {
        //multiple voices found.  either everything has a voice, or it's the default voice, that's a rule
        // Wrap this in a promise.all()
        const voices = slideDom.getElementsByTagName('Voice');
        Array.from(voices).forEach(voice => {
            const voiceID = parseInt(voice.getAttribute("voiceid")) || defaultSlideVoiceID;    
            
            clipObjs.push( ...SplitTextIntoClipText(voice.textContent, voiceID));
        })
        //TODO This is probably incorrect, test it.
        const defaultVoiceTexts = slideDom.getChildNodes.filter(node => node.type !== "Voice");
        Array.from(defaultVoiceTexts).forEach(text => {
            clipObjs.push( ...SplitTextIntoClipText(text.textContent, defaultSlideVoiceID));
        })
    }
    return clipObjs;
}

//Splits a group of text into CLIPSIZE chunks of sentences (basically each row is one clip) combined with the passed in voice for that clip.
export function SplitTextIntoClipText( text, voiceID ) {
    const paragraphs = text.split(/\r\n|\r|\n/);
    let groupedSentences = [];
    paragraphs.forEach( paragraph => {
        const doc = nlp.readDoc( paragraph );
        // Place every sentence in a new row of the table by using .markup() api.

        let sentenceList = doc.sentences().out().filter((el) => {
            return (el != null) && (el.trim() !== "");
          });;

        while (sentenceList.length > 0) {
            groupedSentences.push({
                text: sentenceList.splice(0,CLIPSIZE).join(' '),
                voiceID: voiceID
            })
        }
    });
    return groupedSentences;
}