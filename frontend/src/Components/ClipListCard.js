//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";
import { useState, useEffect,useCallback } from 'react';
import { useAuthTools } from '../Hooks/Auth';
import { useLocation} from "react-router-dom";
import { useDrag } from 'react-dnd'

import { SimpleCard } from "../Elements/SimpleCard";
import {SimpleAudioPlayer} from "../Elements/SimpleAudioPlayer";
import { IconButton } from '../Elements/IconButton'; 
import {LoadingSpinner} from "../Elements/LoadingSpinner";
import {ClipDeleteButton} from "./ClipDeleteButton";
import {ItemTypes} from "./DnDItemTypes";
import {SimpleDropCardWrapper} from "../Elements/SimpleDropCardWrapper";
import {GetClipStatus, e_ClipAudioGenerationStatus} from "../Etc/ClipStatus";
import { GetVoiceName } from "../Etc/Avatars";

export function ClipListCard (props) 
{
    const {clip: propClip, setSelectedClip, updateClip, ordinal: propOrdinal, ...childProps} = props;
    const {token, APICalls} = useAuthTools();
    const [url, setUrl] = useState(null);
    const [recheckTimer, setRecheckTimer] = useState(null);
    const [clip, setClip] = useState(null);
    const [updating, setUpdating] = useState(false);
    const currentLocation = useLocation();

    useEffect( () => {
        clearInterval(recheckTimer);
        setClip(propClip);
        LoadClipAudio(propClip);
        setRecheckTimer(setInterval(RecheckClip, 10000, propClip));
        
    
     },[propClip, propOrdinal]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    function RecheckClip(ctrlClip)
    {
        if (ctrlClip != null && ctrlClip.ClipAudioState == e_ClipAudioGenerationStatus.GeneratingAudio)
        {
            console.log('Reloading clip to check for updates: ' + ctrlClip.ID);
            console.log(ctrlClip);
            APICalls.GetClipDetails(ctrlClip.ID).then(returnClip => {
                updateClip(returnClip); //This should trigger a redraw of this component.           
                setUpdating(false);
            });
        }
    }
    
     function LoadClipAudio(audioClip) //from database
    {
        setUrl(null);
        if (audioClip.HasAudio && audioClip.ClipAudioState == 4)
        {
            APICalls.GetClipAudio(audioClip.ID)
                .then(
                    data => {
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
             updateClip(returnClip); //This should trigger a redraw of this component.           
             setUpdating(false);
         });
     }
     let card = null;
     
    function cardCSS() {
        const base = "SimpleCard-ClipListCard";
        if (clip === null) {
            return base;
        }

        const statusCSS =  " SimpleCard-ClipListCard-"+GetClipStatus(clip).label;

        return base + statusCSS;
    }
    
    if (clip === null){
    
        card = (
            <SimpleCard  {...childProps} className="SimpleCard-ClipListCard">
                <LoadingSpinner/>
            </SimpleCard>
            )
    }
    else {

     card = (
        <div ordinal = {clip.OrdinalValue}>
            <SimpleCard  {...childProps} className={cardCSS()} ordinal = {clip.OrdinalValue}>
                <div class="div-Slide-Details-Container">
                    <p class = "p-clip-card-text-left">
                        Clip: {clip.OrdinalValue}
                    </p>
                    <IconButton icon="refresh" onClick={()=>UpdateClipAudio(clip.ID)}/>
                    <ClipDeleteButton 
                            ItemID = {clip.ID}
                            SlideID = {clip.SlideID}
                            Redirect = {currentLocation.pathname}
                            />
                </div>
                <div class="div-Slide-Details-Container">                               
                    <SimpleAudioPlayer pace = {clip.Speed} volume = {clip.Volume/2} audiofile = {url} 
                        ClipAudioGenerationStatus={clip.ClipAudioState} ErrorMessage = {clip.ClipAudioStateErrorMessage}/>  
                    
                </div>
                <div class="div-Slide-Details-Container">     
                    {/* <Tooltip
                                content={<span>{clip.ClipText}</span>}
                                openOnTargetFocus={false}
                                usePortal={false}
                            >
                            <p class = "p-clip-card-text">
                                ... 
                                </p>
                    </Tooltip> */}
                    <p class = "p-clip-card-text">
                        {GetVoiceName(clip).label}
                    </p>
                </div>            
            </SimpleCard>
        </div>);
    }   
    

   const [{ isDragging, opacity }, dragRef] = useDrag(
        () => ({
            type: ItemTypes.ClipCard,
            item: { card },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.5 : 1,
                isDragging: !!monitor.isDragging()
            })
            }),
            [clip]
    )
    const MoveCard = props.MoveClipCard;


    return (
        <SimpleDropCardWrapper  className = "div-ClipListCard" onClick={()=>setSelectedClip(clip)} 
            MoveCard={MoveCard}
            id={clip ? clip.ID : 0} 
            key={clip ? clip.ID : 0} 
            ordinal = {propOrdinal || (clip?clip.OrdinalValue:0)}>
            <div ref = {dragRef}> 
                {!isDragging && card}
                {isDragging && 'Original Spot'}
            </div>
        </SimpleDropCardWrapper>
    )
}