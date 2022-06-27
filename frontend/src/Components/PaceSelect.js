
 
 import {SimpleSlider} from '../Elements/SimpleSlider'

 const Speeds = [
    {value: 70, label: 'Slowest'},
    {value: 80, label: 'Slower'},
    {value: 90, label: 'Slow'},
    {value: 100, label: 'Normal Pace'},
    {value: 115, label: 'Fast'},
    {value: 130, label: 'Faster'},
    {value: 145, label: 'Fastest'},
];
 
 export function PaceSelect (props) 
 {
     const { clip, onChange} = props;

     const UpdateClip = (value) => {
         var newClip = {...clip, Speed: value}
         onChange(newClip);
     }
  return (

    <div className = 'div-Slider'>
        Pace
        <SimpleSlider  onChange={UpdateClip} max={145} min={70} value = {clip.Speed} labelValues = {[70, 80, 90, 100, 115, 130, 145]}/>
    </div>
  )
 }