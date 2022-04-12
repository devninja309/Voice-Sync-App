import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model' ;
import {LogError} from './ErrorHandler';
import { SELECT_POPOVER } from '@blueprintjs/select/lib/esm/common/classes';
const nlp  = winkNLP( model )
// Acquire "its" and "as" helpers from nlp.
const its = nlp.its;
const as = nlp.as;

const CLIPSIZE = 3;

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
        console.log('UpdateSlideTextOnServer')
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
export function ImportNewSlideText(chapterID, defaultSlideName, defaultVoice, text, APICalls)
{
    //cd f

    let dom = "";
    try {
        let xmlText = "<document>" + text.replace(/”/g, '"')
                                    .replace(/[\u2018\u2019]/g, "'")
                                    .replace(/[\u201C\u201D]/g, '"') 
                                    + "</document>"
        let parser = new DOMParser();
        dom = parser.parseFromString(xmlText, "text/xml");
        const errorNode = dom.querySelector('parsererror');
        if (errorNode) {
          throw 'Bad XML'
        } 
        let slides = dom.getElementsByTagName('Slide');
        let ordinalValue = 1;
        if (slides.length === 0 )
        {
            // There are no slide labels, this is all one slide
            const promise = new Promise((resolve, reject) => {
                CreateSlide(chapterID, defaultSlideName, defaultVoice, null, text, APICalls, ordinalValue++).then(result => {resolve(result)});
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
                let voice = parseInt(slide.getAttribute('voiceid')) || parseInt(slide.getAttribute('VoiceID')) || defaultVoice;
                promiseArray.push( new Promise((resolve, reject) => {
                    CreateSlide(chapterID, name, voice, slide, slide.textContent, APICalls, ordinalValue++)
                        .then(result => {resolve(result)}); //.childNodes[0].nodeValue seems wrong?)
                }
            ))});
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

//Does not parse slide tags
export function CreateSlide(chapterID, slideName, slideVoice, slideDom, text, APICalls, ordinalValue)
{
    const promise = new Promise((resolve, reject) => {
    
    APICalls.CreateSlide({ChapterID:chapterID, SlideName:slideName, DefaultVoice: slideVoice, SlideText: text, OrdinalValue: ordinalValue}).then(slide => {

        if (slide.ID == null) {
            alert(`Invalid slide creation.  Aborting`);
            return;
        }
        try {
            //<Voice VoiceID="1"></Slide>
            //Start by splitting on voices.
            if (slideDom == null || slideDom.getElementsByTagName('Voice').length === 0 )
            {
                // There are no voice labels, so this is all one voice
                // Wrap this in a promise
                SplitVoiceIntoClips(slide, slideVoice, text, APICalls,0).then(async res => {

                    //const sleep = ms => new Promise(r => setTimeout(r, ms));
                    //await sleep(2000);
                    resolve(slide)
                })
            }
            else
            {
                //multiple voices found.  either everything has a voice, or it's the default voice, that's a rule
                //TODO Check for content that isn't wrapped in a voice
                // Wrap this in a promise.all()
                const voices = slideDom.getElementsByTagName('Voice');
                var promiseArray = [];
                let ordinalValue = 1;
                Array.from(voices).forEach(voice => {
                    let voiceString = parseInt(voice.getAttribute("voiceid"));
                    let voiceID = parseInt(voice.getAttribute("voiceid")) || slideVoice;
                    promiseArray.push(SplitVoiceIntoClips( slide, voiceID, voice.childNodes[0].nodeValue, APICalls,ordinalValue));  //.childNodes[0].nodeValue seems wrong?)
                    ordinalValue += SplitTextIntoSentences(voice.textContent).length;
                })
                Promise.all(promiseArray).then(()=>resolve(slide));
            }
        }
        catch (err) {
            console.log('Shouldnt be here');
            LogError(err);

        }})
    });
    

    return promise
}

//Only called for a subset of text in a single voice
export async function SplitVoiceIntoClips(slide, voice, text, APICalls ,ordinalValue) {

    var promiseArray = [];

    var clips = SplitTextIntoSentences(text);
    

    clips.forEach( clipText => {
        const promise = new Promise((resolve, reject) => {
            const clip = {SlideID:slide.ID, ClipText:clipText, VoiceID: voice, OrdinalValue: ordinalValue++}                
            
            APICalls.CreateClip(clip,voice).then(async newClip=>{
                console.log('clip:', newClip);
                resolve()
            })
            // APICalls.CreateClip(clip,voice).then(()=>{
            //     resolve()
            // })
        })
        promiseArray.push(promise);
    })

    //const sleep = ms => new Promise(r => setTimeout(r, ms));
    //promiseArray.push(sleep(10000).then(x => {console.log('nanny nanny boo boo')}));

    const allPromise = Promise.all(promiseArray);

    return allPromise;
    
}

export function SplitTextIntoSentences( text ) {
    const paragraphs = text.split(/\r\n|\r|\n/);
    let groupedSentences = [];
    paragraphs.forEach( paragraph => {
        const doc = nlp.readDoc( paragraph );
        // Place every sentence in a new row of the table by using .markup() api.

        let sentenceList = doc.sentences().out().filter((el) => {
            return (el != null) && (el.trim() != "");
          });;

        while (sentenceList.length > 0) {
            groupedSentences.push(sentenceList.splice(0,CLIPSIZE).join(' '))
        }
    });
    return groupedSentences;
}