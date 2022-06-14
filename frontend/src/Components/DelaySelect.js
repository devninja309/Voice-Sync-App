
import { Avatars } from '../Etc/Avatars';

import { SimpleSlider } from '../Elements/SimpleSlider';

 
 export function DelaySelect (props) 
 {
     const { clip, onChange} = props;

     const UpdateClip = (value) => {
         var newClip = {...clip, Delay: value}
         onChange(newClip);
     }
  return (
    <div className='div-Slider'>
          Delay
        <SimpleSlider  onChange={UpdateClip} max={5} min={.2} stepSize={.1} value = {clip.Delay} labelValues = {[.5,2,3,5]}/>
    </div>
  )
 }