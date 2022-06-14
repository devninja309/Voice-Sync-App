//Simple button to play an audio button.  Grey if no clip.  Yellow if clip is stale.
import { useEffect, useState } from 'react';
import {LoadingSpinner} from "./LoadingSpinner";
import {IconButton} from "./IconButton";
import {SimpleSlider} from "./SimpleSlider";
import { e_ClipAudioGenerationStatus} from "../Etc/ClipStatus";
import {useCardContextTools} from "../Hooks/CardManager";
//import audio from 'fluent-ffmpeg/lib/options/audio';

export function SimpleAudioPlayer(props) {
    const [file, setFile] = useState(null);
    const [duration, setDuration] = useState(100);
    const [trackProgress, setTrackProgress] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [audioControl, setAudioControl] = useState(null);

    const cardContextTools = useCardContextTools();

    useEffect( () => {
        const updateSliderInterval = setInterval(updateSlider, 100);
        return () => {
            clearInterval(updateSliderInterval);
        }
    });

    useEffect( () => {
        setFile(props.audiofile);
     },[props.audiofile]);

    useEffect( () => {
        if (file != null) {
            const audio = new Audio(file);
            audio.addEventListener('loadeddata', () => {    
                setDuration (audio.duration)
              })
            setAudioControl(audio);
        } 
    }, [file]);

if (props.updating || props.ClipAudioGenerationStatus === e_ClipAudioGenerationStatus.GeneratingAudio)
{
    return <LoadingSpinner/>
}
if (props.ClipAudioGenerationStatus === e_ClipAudioGenerationStatus.ErrorGeneratingAudio)
{
    return <div className= "div-HorizontalContainer"><IconButton icon="error"/> <p className="p-no-audio"> {props.ErrorMessage}</p></div>
}
if (!file) {
    return (
        <div className = "div-HorizontalContainer">
        <p className="p-no-audio">No Audio</p>
        </div>
    )
}
async function  PlayAudio() {

    const vol = (props.volume||100) /100;
    const pace = (props.pace||100) /100;

    try {
        audioControl.playbackRate = pace;
        audioControl.volume = vol;
        console.log('Volume: ' + audioControl.volume)

        setPlaying(true);     
        
        audioControl.addEventListener("ended", function() 
        {
             setPlaying(false);
        });

        audioControl.play();
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
        audioControl.currentTime = 0;
        setPlaying(false)
    }
}
async function SetCurrentTime(number) {
    console.log('Here!' + number);
    if (audioControl !== null) {
        audioControl.currentTime = number;
        setTrackProgress(number);
    }
}
function MovingSlider(number) {
    console.log('Moving!' + number);
    if (audioControl !== null) {
        audioControl.currentTime = number;
        setTrackProgress(number);
    }
}
function updateSlider() {
    if (audioControl!= null) {
        setTrackProgress(audioControl.currentTime);
    }
}
const enter = () => {
    if (cardContextTools?.setOverrideDND){
        cardContextTools.setOverrideDND(true)
    }
}
const exit = () => {
    if (cardContextTools?.setOverrideDND){
        cardContextTools.setOverrideDND(false)
    }

}
function getLabelValues() {
    if (isNaN(duration)) {
        return [0,2.5,5.0,7.5,10.0]
    }
    else {
        return [0, duration / 4, duration/2, 3 * duration / 4, duration]
    }
}
function getMaxDuration() {
    if (isNaN(duration)) {
        return 10;
    }
    else {
        return duration;
    }
    
}
 /*<SimpleSlider max={getMaxDuration()} min={0} stepSize={.25} showTrackFill = {true} value = {audioControl?.currentTime ?? 0}
                labelValues = {getLabelValues()} onRelease = {SetCurrentTime2}/>*/
console.log("isWideStyle:" , props.isWideStyle);
if (!playing || audioControl && audioControl.ended) {
    return (
        <div style={props.isWideStyle?({ display:'flex'}):({display:'block'})}
            onMouseEnter={enter}
            onMouseLeave={exit}>
            {file!= null && <a href={file} download={props.typeString +'-' + props.objectURL + '-Audio.mp3'}>
            <IconButton icon="cloud-download" text={"Download " + props.typeString + " Audio"} download/>
            </a>} 
            <IconButton icon='play' onClick={PlayAudio}/>
            <div style={{ position: "relative", zIndex: "10", paddingLeft: "10pt", paddingRight: "10pt" }}>
                <SimpleSlider max={getMaxDuration()} min={0} stepSize={.25} showTrackFill = {true} value = {trackProgress}
                        labelValues = {getLabelValues()} onRelease = {SetCurrentTime} onChange= {MovingSlider} />
            </div>
        </div>
    )
}
else{
    return (
        <div
            onMouseEnter={enter}
            onMouseLeave={exit}>
            <div className = "div-HorizontalContainer">
                <IconButton icon='pause' onClick={PauseAudio}/>
                <IconButton icon='stop' onClick={StopAudio}/>
            </div>
            <div style={{ position: "relative", zIndex: "10" }}>
                <SimpleSlider max={getMaxDuration()} min={0} stepSize={.25} value = {trackProgress}
                    labelValues = {getLabelValues()}  onRelease = {(number) => SetCurrentTime} />
            </div>
        </div>
    )
}
}