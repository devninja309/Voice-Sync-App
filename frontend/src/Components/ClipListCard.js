//Simple button, base class for other buttons

import * as React from "react";
import { useState, useEffect } from 'react';
import { useAuthTools } from '../Hooks/Auth';
import { useLocation} from "react-router-dom";
import { useDrag } from 'react-dnd'

import { SimpleCard } from "../Elements/SimpleCard";
import {SimpleAudioPlayer} from "../Elements/SimpleAudioPlayer";
import { IconButton } from '../Elements/IconButton'; 
import {LoadingSpinner} from "../Elements/LoadingSpinner";
import {SimpleButton} from "../Elements/SimpleButton";
import {ClipDeleteButton} from "./ClipDeleteButton";
import {ItemTypes} from "./DnDItemTypes";
import {SimpleDropCardWrapper} from "../Elements/SimpleDropCardWrapper";
import {GetClipStatus, e_ClipAudioGenerationStatus} from "../Etc/ClipStatus";
import { GetVoiceName } from "../Etc/Avatars";
import {useCardContextTools} from "../Hooks/CardManager";

export function ClipListCard (props) 
{
    const {clip: propClip, setSelectedClip, updateClip, ordinal: propOrdinal, selectedClip, selectedClipChanged, saveSelectedClip, ...childProps} = props;
    const { APICalls} = useAuthTools();
    const [url, setUrl] = useState(null);
    const [recheckTimer, setRecheckTimer] = useState(null);
    const [recheckStopped, setRecheckStopped] = useState(false);
    const [clip, setClip] = useState(null);
    const currentLocation = useLocation();


    const { overrideDND } = useCardContextTools();

    useEffect( () => {
        clearInterval(recheckTimer);
        setClip(propClip);
        LoadClipAudio(propClip);
        const recheck = setInterval(RecheckClip, 5000, propClip);
        setRecheckTimer(recheck);
        return () => {
            clearInterval(recheck);
            setRecheckStopped(true);
        }
    
    },[propClip, propOrdinal]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    
     function RecheckClip(ctrlClip)
    {
        if (ctrlClip != null && ctrlClip.ClipAudioState === e_ClipAudioGenerationStatus.GeneratingAudio && !recheckStopped)
        {
            APICalls.GetClipDetails(ctrlClip.ID).then(returnClip => {
                if (returnClip.ClipAudioState !== e_ClipAudioGenerationStatus.GeneratingAudio)
                {
                    updateClip(returnClip); //This should trigger a redraw of this component.  
                }  
            });
        }
    }
    
     function LoadClipAudio(audioClip) //from database
    {
        setUrl(null);
        if (audioClip.HasAudio && audioClip.ClipAudioState === 4)
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
    //Request new audio generation
    function UpdateClipAudio(clipID)
    {
        APICalls.UpdateClipAudio(clipID).then(returnClip => {
            updateClip(returnClip); //This should trigger a redraw of this component.   
        });
    }
    function ApproveClip() {
        const updatedClip = {...clip, ClipStatusID: 2}
        APICalls.UpdatePostClip(updatedClip).then(returnClip => {
            updateClip(returnClip, true); //This should trigger a redraw of this component.   
        });
    }
    let card = null;
     
    function cardCSS() {
        const baseCSS = "SimpleCard-ClipListCard";
        const selectedCSS = selectedClip ? " SimpleCard-Selected" : "";
        if (clip === null) {
            return baseCSS;
        }

        const statusCSS =  " SimpleCard-ClipListCard-"+GetClipStatus(clip).label;

        return baseCSS + statusCSS + selectedCSS;
    }
    function titleCSS() {
        const baseCSS = "p-clip-card-text-left";
        const selectedCSS = "p-clip-card-text-left-selected";
        return selectedClip ? selectedCSS : baseCSS
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
                    <p class = {titleCSS()}>
                        Clip: {clip.OrdinalValue}
                    </p>
                    {(selectedClipChanged && selectedClip) ? <IconButton icon="cloud-upload" onClick={()=>saveSelectedClip()}/>
                        : <IconButton icon="refresh" onClick={()=>UpdateClipAudio(clip.ID)}/>}
                    
                    <ClipDeleteButton 
                            ItemID = {clip.ID}
                            SlideID = {clip.SlideID}
                            Redirect = {currentLocation.pathname}
                            />
                </div>
                <div class="div-Slide-Details-Container"> 
                                                 
                    <SimpleAudioPlayer pace = {clip.Speed} volume = {clip.Volume/2} audiofile = {url} objectURL = {clip.ID} typeString = {"Clip"}
                        ClipAudioGenerationStatus={clip.ClipAudioState} ErrorMessage = {clip.ClipAudioStateErrorMessage}/>  
                    
                </div>
                <div class="div-Slide-Details-Container">     
                    <p class = "p-clip-card-text">
                        {GetVoiceName(clip).label}
                    </p>
                    {(clip.ClipStatusID === 1) &&<IconButton icon="thumbs-up" onClick={()=>ApproveClip()}/> }
                </div>            
            </SimpleCard>
        </div>);
    }   
    

   const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: ItemTypes.ClipCard,
            item: { card },
            canDrag : () => {
                return !overrideDND;
            },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.5 : 1,
                isDragging: !!monitor.isDragging()
            })
            }),
            [clip]
    )
    const MoveCard = props.moveClipCard;

    return (
        <SimpleDropCardWrapper  className = "div-ClipListCard" onClick={()=>setSelectedClip(clip)} 
            movecard={MoveCard}
            id={clip ? clip.ID : 0} 
            key={clip ? clip.ID : 0} 
            ordinal = {propOrdinal || (clip?clip.OrdinalValue:0)}>
            <div ref = {dragRef} /*onDragStart = {handleDragStart} */>
                {!isDragging && card}
                {isDragging && 'Original Spot'}
            </div>
        </SimpleDropCardWrapper>
    )
}