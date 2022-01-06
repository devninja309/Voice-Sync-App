//Simple button to play an audio button.  Grey if no clip.  Yellow if clip is stale.
import { useCallback, useEffect, useState } from 'react';

export function PlayAudioClip(props) {
    const [url, setUrl] = useState('');


var file = props.audiofile;
if (!file) {
    return (
        <p className="p-no-audio">No Audio</p>
    )
}
console.log('url')
console.log(props.audiofile)
    return (
    <audio controls src={props.audiofile} />
    )
}