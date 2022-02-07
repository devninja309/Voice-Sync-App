//Simple button to play an audio button.  Grey if no clip.  Yellow if clip is stale.
import { Icon } from '@blueprintjs/core';
import { useCallback, useEffect, useState } from 'react';
import {LoadingSpinner} from "./LoadingSpinner";
import {IconButton} from "./IconButton";

export function SimpleAudioPlayer(props) {
    const [url, setUrl] = useState('');



var file = props.audiofile;
if (props.updating)
{
    return <LoadingSpinner/>
}
if (!file) {
    return (
        <p className="p-no-audio">No Audio</p>
    )
}
async function  PlayAudio() {
    const vol = (props.volume||100) /100;
    const pace = (props.pace||100) /100;
    console.log('Volume' + vol);

    try {
        const audioCtx = new window.AudioContext();

        let arrayBuffer = await fetch(file).then(r => r.arrayBuffer());
    
        const clipAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const track = audioCtx.createBufferSource();
        track.buffer = clipAudioBuffer;

        track.playbackRate.value = pace;
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = vol;

        track.connect(gainNode).connect(audioCtx.destination);

        track.start();
    }
    catch (err) {
        console.log('Audio error')
        console.log(err);
    }
}
console.log('url')
//<audio controls src={props.audiofile} />
console.log(props.audiofile)
    return (
        <div>
            <IconButton icon='play' onClick={PlayAudio}/>
        </div>
    )
}