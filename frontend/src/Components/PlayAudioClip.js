//Simple button to play an audio button.  Grey if no clip.  Yellow if clip is stale.


export function PlayAudioClip(props) {
var file = props.audiofile;
if (!file) {
    return (
        <p className="p-no-audio">No Audio</p>
    )
}
    return (
    <audio controls src={file} />
    )
}