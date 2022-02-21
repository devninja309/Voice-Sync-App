
 
 import {useState, useEffect} from 'react';
 import { Link } from 'react-router-dom';
import { Avatars } from '../Etc/Avatars';
 import{useAuthTools} from '../Hooks/Auth';

import { SimpleSlider } from '../Elements/SImpleSlider';

 const Volumes = [
    {value: 20, label: 'Quietest'},
    {value: 60, label: 'Quieter'},
    {value: 80, label: 'Quiet'},
        {value: 100, label: 'Normal Volume'},
        {value: 150, label: 'Loud'},
        {value: 200, label: 'Louder'},
        {value: 500, label: 'Loudest'},
];
 
 export function VolumeSelect (props) 
 {
     const { clip, onChange, ...childprops} = props;
     const avatars = Avatars;

     const UpdateClip = (value) => {
         var newClip = {...clip, Volume: value}
         onChange(newClip);
     }
  return (
    <div className='div-Slider'>
          Volume
        <SimpleSlider  onChange={UpdateClip} max={200} min={20} value = {clip.Volume} labelValues = {[20,50,75, 100,125,150,200]}/>
    </div>
  )
 }