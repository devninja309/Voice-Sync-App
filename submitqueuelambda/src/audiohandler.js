


import { GetClipDetails, UpdateClipAudio, GetPronunciations, LogClipGeneration } from './databasestorage/dataaccess.js';
import fetch from "node-fetch";
import { ConvertPronunciationFast } from './voicesynthapi/Pronunciation.js';

const ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"
const auth0EndPoint = "https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json"
const auth0NameSpace = "https://industryacademy.com/"
const defaultPageSize = 20;


export default async function GenerateClipAudioFile(clipId, pooledConnection) {
    const timeout = 30000; //Timeout after 30 seconds

    var result = {
        status: 200,
        message: "Successful"
    }
    try {
        let clip = await GetClipDetails(clipId), pooledConnection;
        const avatarId = clip.VoiceID;
        const rawText = clip.ClipText;

        const pronunciations = await GetPronunciations(pooledConnection);

        const text = ConvertPronunciationFast(pronunciations, rawText);

        const abortController = new AbortController();
        const id = setTimeout(() => { abortController.abort() }, timeout);

        const ttsResponse = await fetch(ttsEndPoint, {
            signal: abortController.signal,
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
        clearTimeout(id);

        let status = ttsResponse.status;
        if (status != 200) //TODO, this will timeout, right?
        {
            console.log('Failed to get audio file', 'tts Response Status was invalid', ttsResponse, "\nStatus: ", ttsResponse.status, '\nTimestamp: ', Date.now());
            result.status = status;
            result.message = (!ttsResponse || ttsResponse.length === 0) ? 'Unknown Error From WellSaid Generating Clip' : ttsResponse.statusText
            return result;
        }
        else {
            console.log('Successful audio generation\n', ttsResponse.headers);
        }

        //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
        const responseBlob = await ttsResponse.blob()
        const responseArray = await responseBlob.arrayBuffer();
        const buffer = await Buffer.from(responseArray);
        clip.AudioClip = buffer;


        var saveResult = await UpdateClipAudio(clipId, buffer, pooledConnection);
        if (saveResult.Successful) {
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
        console.log('Error Generating Clip:', exp, '\nTimestamp: ', Date.now())
        result.status = 0
        result.message = (!exp || exp.length === 0) ? 'Unknown Error Generating Clip' : err
        return result;
    }


}