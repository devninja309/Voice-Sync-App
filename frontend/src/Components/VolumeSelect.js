
 
 import {useState, useEffect} from 'react';
 import { Link } from 'react-router-dom';
import { Avatars } from '../Etc/Avatars';
 import{useAuthTools} from '../Hooks/Auth';

 import {SimpleSelect} from '../Elements/SimpleSelect'

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

     const UpdateClip = (event) => {
         var newClip = {...clip, Volume: event.target.value}
         onChange(newClip);
     }
  
  return (
        <SimpleSelect className = "simpleSelect-small" onChange={UpdateClip} options={Volumes} value = {clip.Volume}/>
  )
 }