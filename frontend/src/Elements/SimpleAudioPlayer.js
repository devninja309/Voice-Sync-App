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
function PlayAudio() {
    const audio = new Audio(file);
    audio.play();
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