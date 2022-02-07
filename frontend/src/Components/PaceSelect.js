
 
 import {useState, useEffect} from 'react';
 import { Link } from 'react-router-dom';
import { Avatars } from '../Etc/Avatars';
 import{useAuthTools} from '../Hooks/Auth';

 import {SimpleSelect} from '../Elements/SimpleSelect'

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
     const { clip, onChange, ...childprops} = props;
     const avatars = Avatars;

     const UpdateClip = (event) => {
         var newClip = {...clip, Speed: event.target.value}
         onChange(newClip);
     }
  
  return (
        <SimpleSelect className = "simpleSelect-small" onChange={UpdateClip} options={Speeds} value = {clip.Speed}/>
  )
 }