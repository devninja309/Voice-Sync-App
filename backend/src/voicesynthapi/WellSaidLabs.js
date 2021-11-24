//Specific details for WellSaid
import fetch from "node-fetch";

//GetAudioFromWellSaid

export async function  getClip  (){
    const ttsResponse = await fetch(ttsEndPoint, {
      signal: abortController.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.WELLSAID_API_KEY,
      },
      body: JSON.stringify({
        speaker_id: avatarId,
        text,
      }),
    });
}