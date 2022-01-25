//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";
import { ButtonGroup, Icon } from '@blueprintjs/core';
import { useState, useEffect,useCallback } from 'react';
import { useAuthTools } from '../Hooks/Auth';
import { useLocation} from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";
import {SimpleAudioPlayer} from "../Elements/SimpleAudioPlayer";
import { IconButton } from '../Elements/IconButton'; 
import {LoadingSpinner} from "../Elements/LoadingSpinner";
import {ClipDeleteButton} from "./ClipDeleteButton";

export function ClipListCard (props) 
{
    const {clip: propClip, setSelectedClip, updateClip, ...childProps} = props;
    const {token, APICalls} = useAuthTools();
    const [url, setUrl] = useState(null);
    const [clip, setClip] = useState(null);
    const [updating, setUpdating] = useState(false);
    const currentLocation = useLocation();

    useEffect( () => {
        setClip(propClip);
        console.log(propClip);
        LoadClipAudio(propClip);
    
     },[propClip]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    function LoadClipAudio(audioClip) //from database
    {
        setUrl(null);
        if (audioClip.AudioClip != null)
        {
        APICalls.GetClipAudio(audioClip.ID)
            .then(
                data => {
                    console.log('Got clip audio')
                    data.blob().then ( responseBlob => {
                        const objectURL = URL.createObjectURL(responseBlob);
                        setUrl(objectURL);
                    })

            })
        }
    }
     function UpdateClipAudio(clipID)
     {
         setUpdating(true);
         APICalls.UpdateClipAudio(clipID).then(returnClip => {
             //setClip(returnClip);
             updateClip(returnClip); //This should trigger a redraw of this component.
             setUpdating(false);
         });
     }
    if (clip === null){

        return ( 
            <div className = "div-ClipListCard" key="Loading" onClick={()=>setSelectedClip(clip)}>
                <SimpleCard  {...childProps} className="SimpleCard-ClipListCard">
                    <LoadingSpinner/>
                </SimpleCard>
            </div>)
    }

    return (
        <div className = "div-ClipListCard" key={clip.ID} onClick={()=>setSelectedClip(clip)}>
            <SimpleCard  {...childProps} className="SimpleCard-ClipListCard">
                <div class="div-Slide-Details-Container">
                    <p class = "p-clip-card-text">
                        Clip: {clip.OrdinalValue}
                    </p>
                                           
                    <IconButton icon="refresh" onClick={()=>UpdateClipAudio(clip.ID)}/>
                </div>
                <div class="div-Slide-Details-Container">
                    <SimpleAudioPlayer audiofile = {url} updating={updating}/>  
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
                <ClipDeleteButton 
                        ItemID = {clip.ID}
                        SlideID = {clip.SlideID}
                        Redirect = {currentLocation.pathname}
                        />
                
            </SimpleCard>
        </div>
    )
}