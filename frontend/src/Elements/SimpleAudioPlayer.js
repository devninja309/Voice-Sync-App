//Simple button to play an audio button.  Grey if no clip.  Yellow if clip is stale.
import { Icon } from '@blueprintjs/core';
import { useCallback, useEffect, useState } from 'react';
import {LoadingSpinner} from "./LoadingSpinner";
import {IconButton} from "./IconButton";

export function SimpleAudioPlayer(props) {
    const [url, setUrl] = useState('');
    const [playing, setPlaying] = useState(false);
    const [audioControl, setAudioControl] = useState(null);



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
    if (audioControl != null && ! audioControl.ended) {
        audioControl.play();
        setPlaying(true);
        return;
    }

    const vol = (props.volume||100) /100;
    const pace = (props.pace||100) /100;
    console.log('Volume' + vol);

    try {
        const audioCtx = new window.AudioContext();
        const audio = new Audio(file);
        audio.playbackRate = pace;
        audio.volume = vol;

        setAudioControl(audio);
        setPlaying(true);     
        
        audio.addEventListener("ended", function() 
        {
             setPlaying(false);
        });

        audio.play();
    }
    catch (err) {
        console.log('Audio error')
        console.log(err);
    }
}
async function PauseAudio() {
    if (audioControl != null) {
        audioControl.pause();
        setPlaying(false);
    }
}
async function StopAudio() {
    if (audioControl != null) {
        audioControl.pause();
        setAudioControl(null);
        setPlaying(false)
    }
}
console.log('url')
//<audio controls src={props.audiofile} />
console.log(props.audiofile)
if (!playing || audioControl && audioControl.ended) {
    return (
        <div>
            <IconButton icon='play' onClick={PlayAudio}/>
        </div>
    )
}
else{
    return (
        <div className = "div-HorizontalContainer">
        <IconButton icon='pause' onClick={PauseAudio}/>
        <IconButton icon='stop' onClick={StopAudio}/>
        </div>
    )
}
}