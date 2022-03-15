//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";
import { ButtonGroup, Icon } from '@blueprintjs/core';
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
import { SlideQuickSelect } from "./SlideQuickSelect";

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
        LoadClipAudio(propClip);
    
     },[propClip]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    function LoadClipAudio(audioClip) //from database
    {
        setUrl(null);
        if (audioClip.HasAudio)
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
             //setClip(returnClip);
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
        const approved = (clip.Approved) ? " SimpleCard-ClipListCard-Approved": "";

        return base + approved;
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
                    <p class = "p-clip-card-text">
                        Clip: {clip.OrdinalValue}
                    </p>
                                           
                    <IconButton icon="refresh" onClick={()=>UpdateClipAudio(clip.ID)}/>
                    <SimpleAudioPlayer pace = {clip.Speed} volume = {clip.Volume/2} audiofile = {url} updating={updating}/>  
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
                </div>
                <p class = "p-clip-card-text">
                    Voice: {clip.VoiceID}
                </p>
                
                
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
            ordinal = {clip?clip.OrdinalValue:0}>
            <div ref = {dragRef}> 
                {!isDragging && card}
                {isDragging && 'Original Spot'}
            </div>
        </SimpleDropCardWrapper>
    )
}