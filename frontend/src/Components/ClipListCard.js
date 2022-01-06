//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";
import { ButtonGroup, Icon } from '@blueprintjs/core';
import { useState, useEffect,useCallback } from 'react';
import { useAuthTools } from '../Hooks/Auth';

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";
import { IconButton } from '../Elements/IconButton'; 

export function ClipListCard (props) 
{
    const {clip, setSelectedClip, updateClipAudio, ...childProps} = props;
    const {token, APICalls} = useAuthTools();
    const [url, setUrl] = useState(null);
    let objectURL = null;
    useEffect( () => {
        if (clip.AudioClip != null)
        {
            console.log('ClipListCard audio conversion');

            APICalls.GetClipAudio(clip.ID)
            .then(
                data => {
                    console.log('Got clip audio')
                    data.blob().then ( responseBlob => {
                        const objectURL = URL.createObjectURL(responseBlob);
                        setUrl(objectURL);
                    })

                })
        }
    
     },[clip]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    

    //const LinkAddress = '/courses/' + script.CourseID + '/scripts/' + script.ID
    return (
        <div className = "div-ClipListCard" key={clip.ID} onClick={()=>setSelectedClip(clip)}>
            <SimpleCard  {...childProps} className="SimpleCard-ClipListCard">
                <div class="div-Slide-Details-Container">
                    <p class = "p-clip-card-text">
                        Clip: {clip.OrdinalValue}
                    </p>
                                           
                    <IconButton icon="refresh" onClick={()=>updateClipAudio(clip.ID)}/>
                </div>
                <div class="div-Slide-Details-Container">
                    <PlayAudioClip audiofile = {url} />  
                </div>
                <p class = "p-clip-card-text">
                    Voice: {clip.VoiceID}
                </p>
                
                <Tooltip
                            content={<span>{clip.ClipText}</span>}
                            openOnTargetFocus={false}
                            usePortal={false}
                        >
                            ...
                </Tooltip>
                
            </SimpleCard>
        </div>
    )
}