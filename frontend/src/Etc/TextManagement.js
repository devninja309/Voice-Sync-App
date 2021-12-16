import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model' ;
import {LogError} from './ErrorHandler';
const nlp  = winkNLP( model )
// Acquire "its" and "as" helpers from nlp.
const its = nlp.its;
const as = nlp.as;

//Imports a slide text file, creates 1-many slides and returns a promise that resolves with the first slide
export function ImportNewSlideText(chapterID, defaultSlideName, defaultVoice, text, APICalls)
{
    //<Slide Name="SlideName" VoiceID="1"></Slide>

    let dom = "";
    try {
        let xmlText = "<document>" + text + "</document>"
        let parser = new DOMParser();
        dom = parser.parseFromString(xmlText, "text/html");
        let slides = dom.getElementsByTagName('Slide');
        if (slides.length === 0 )
        {
            console.log('Single Slide File');
            // There are no slide labels, this is all one slide
            return new Promise((resolve, reject) => {
                CreateSlide(chapterID, defaultSlideName, defaultVoice, text, APICalls).then(result => {resolve(result)});
            })
        }
        else
        {
            //multiple slides found
            // Wrap this in a promise.all(), but only resolve as the first one
            var promiseArray = [];
            slides.forEach(slide => {
                let name = slide.getAttribute("Name") || defaultSlideName;
                let voice = slide.getAttribute("VoiceID") || defaultVoice;
                promiseArray.push( new Promise((resolve, reject) => {
                    CreateSlide(chapterID, name, voice, slide.childNodes[0].nodeValue, APICalls)
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
export function CreateSlide(chapterID, slideName, slideVoice, text, APICalls)
{
    return new Promise((resolve, reject) => {
    
    APICalls.CreateSlide({ChapterID:chapterID, SlideName:slideName, DefaultVoice: slideVoice, SlideText: text}).then(slide => {

        let dom = "";
        try {
            //<Voice VoiceID="1"></Slide>
            let xmlText = "<document>" + text + "</document>"
            let parser = new DOMParser();
            dom = parser.parseFromString(xmlText, "text/html");
            //Start by splitting on voices.
            let voices = dom.getElementsByTagName('Voice');
            if (voices.length === 0 )
            {
                console.log('slide has one voice');
                // There are no voice labels, so this is all one voice
                // Wrap this in a promise
                SplitVoiceIntoClips(slide, slideVoice, text, APICalls).then(resolve(slide))
            }
            else
            {
                //multiple voices found.  either everything has a voice, or it's the default voice, that's a rule
                //TODO Check for content that isn't wrapped in a voice
                // Wrap this in a promise.all()
                var promiseArray = [];
                voices.forEach(voice => {
                    let voiceID = slide.getAttribute("VoiceID") || slideVoice;
                    promiseArray.push(SplitVoiceIntoClips( slide, voiceID, voice.childNodes[0].nodeValue, APICalls));  //.childNodes[0].nodeValue seems wrong?)
                })
                Promise.all(promiseArray).then(()=>resolve(slide));
            }
        }
        catch (err) {
            LogError(err);

        }
    })
})
}

//Only called for a subset of text in a single voice
export function SplitVoiceIntoClips(slide, voice, text, APICalls ) {
    console.log('single voice')
    console.log(text);

    var promiseArray = [];

    var clips = SplitTextIntoSentences(text);

    clips.forEach(clipText => {
        promiseArray.push(new Promise((resolve, reject) => {
            const clip = {SlideID:slide.ID, ClipText:clipText, VoiceID: voice}
            APICalls.CreateClip(clip,voice).then(()=>resolve())
        }))
    })

    return Promise.all(promiseArray);
    
}

export function SplitTextIntoSentences( text ) {
    console.log('Pre split');
    console.log(text);
        const doc = nlp.readDoc( text );
        // Place every sentence in a new row of the table by using .markup() api.
        console.log('splitting sentences');
        let sentenceList = doc.sentences().out();
        console.log(sentenceList);
        return sentenceList;
}