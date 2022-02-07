
 
 import {useState, useEffect} from 'react';
 import { Link } from 'react-router-dom';
import { Avatars } from '../Etc/Avatars';
 import{useAuthTools} from '../Hooks/Auth';

 import {SimpleSelect} from '../Elements/SimpleSelect'
 
 export function VoiceSelect (props) 
 {
     const {selectedVoice, clip, onChange, ...childprops} = props;
     const avatars = Avatars;

     const [voiceID, setVoiceID] = useState('')
     console.log('Checking voice ids')
     console.log(voiceID);
     console.log(clip.VoiceID);

    useEffect( () => {
        setVoiceID(clip.VoiceID);  
     },[clip]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    
     const UpdateClip = (event) => {
         console.log(event.target.value);
         setVoiceID(event.target.value);
         var newClip = {...clip, VoiceID: event.target.value}
         onChange(newClip);
     }
  
  return (
        <SimpleSelect className = "simpleSelect-small" onChange={UpdateClip} options={avatars} value = {clip.VoiceID}/>
  )
 }