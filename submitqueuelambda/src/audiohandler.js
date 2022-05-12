


import { GetClipDetails, UpdateClipAudio,  GetPronunciations, LogClipGeneration} from './databasestorage/dataaccess.js';
import fetch from "node-fetch";
import { ConvertPronunciationFast } from './voicesynthapi/Pronunciation.js';
  
const ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"
const auth0EndPoint = "https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json"
const auth0NameSpace = "https://industryacademy.com/"
const defaultPageSize = 20;


export default async function GenerateClipAudioFile(clipId)
{
    var result = {
        status: 200,
        message: "Successful"
    }
    try {
        let clip = await GetClipDetails(clipId);
        const avatarId = clip.VoiceID;
        const rawText = clip.ClipText;

        const pronunciations  = await GetPronunciations();

        const text = ConvertPronunciationFast(pronunciations, rawText);

        console.log('Audio text:' + text)

        const ttsResponse = await fetch(ttsEndPoint, {
            //signal: abortController.signal,
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.WELLSAID_API_KEY,
            },
            body: JSON.stringify({
            speaker_id: avatarId,
            text: text,
            }),
        });

        let status = ttsResponse.status;
        //TODO handle invalid responses here
        if (status != 200)
        {
            console.log('Failed to get audio file');
            console.log('tts Response Status was invalid');
            console.log(ttsResponse.status);
            ctx.status = 500;
            console.log(ttsResponse);
            result.status = status;
            result.message = ttsResponse
        }
        else {
            console.log('Successful audio generation');
            console.log(ttsResponse.headers);
        }     

        //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
        const responseBlob = await ttsResponse.blob()
        const responseArray = await responseBlob.arrayBuffer();
        const buffer = await Buffer.from(responseArray);
        clip.AudioClip = buffer;


        var saveResult = await UpdateClipAudio(clipId, buffer);
        if (saveResult.Successful){ 
            console.log("Successful Save")       
            return result;
        }
        else {
            console.log("Bad Save")   
            console.log(saveResult);
            result.status = 0
            result.message = saveResult.errorString
            return result;
        }
    }
    catch (exp) {
        console.log('Error Generating Clip')
        console.log(exp);
        result.status = 0
        result.message = exp
        return result;
    }
        

}