
import {AudioContext} from 'web-audio-api';
import {GetClipAudio} from './databasestorage/dataaccess.js';

export function ProcessSlide(slide) {
    clips = slide.clips.map(clip => 1
        )
}


async function ProcessClip(clip, ) {
    const audioContext = new AudioContext();
    
    const clipAudioBlob = await GetClipAudio(clip.clipID);

    const clipAudioArrayBuffer = await clipAudio.arrayBuffer();

    const clipAudioBuffer = await audioContext.decodeAudioData(clipAudioArrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = clipAudioBuffer;
    source.playbackRate.value = clip.Speed;


    const gainNode = audioCtx.createGain();
    gainNode.gain.value = Volume;

    var destination = audioCtx.createMediaStreamDestination();

    track.connect(gainNode).connect(audioCtx.destination);


}