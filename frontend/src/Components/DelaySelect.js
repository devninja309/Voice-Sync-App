
 
 import {useState, useEffect} from 'react';
 import { Link } from 'react-router-dom';
import { Avatars } from '../Etc/Avatars';
 import{useAuthTools} from '../Hooks/Auth';

import { SimpleSlider } from '../Elements/SImpleSlider';

 
 export function DelaySelect (props) 
 {
     const { clip, onChange, ...childprops} = props;
     const avatars = Avatars;

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