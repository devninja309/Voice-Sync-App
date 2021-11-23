


import React from 'react';

export default function PlayStreamAudioClip (props)  {
    
    return (
<div style={{ marginBottom: props.url ? 24 : 0 }}>
{props.url && (<audio controls src={props.url} />)}
</div>
)}
