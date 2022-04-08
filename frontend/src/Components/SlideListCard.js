//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";
import { useState, useEffect,useCallback } from 'react';

import { SimpleCard } from "../Elements/SimpleCard";
import {SimpleAudioPlayer} from "../Elements/SimpleAudioPlayer";
import { useAuthTools } from '../Hooks/Auth';

import {SlideDeleteButton} from "./SlideDeleteButton";



export function SlideListCard (props) 
{
    const {slide, ...childProps} = props;
    const LinkAddress = '/courses/' + slide.CourseID + '/chapters/' + slide.ChapterID + '/slides/' + slide.ID

    const [slideAudioUpdating, setSlideAudioUpdating] = useState(false);
    const [slideAudioURL, setSlideAudioURL] = useState(null);

    const {token, APICalls} = useAuthTools();

    useEffect( () => {
        if (slide.HasAudio) {
            getSlideAudio(slide.ID);
        }
    },[slide])

    function getSlideAudio(slideID) {
        setSlideAudioUpdating(true);
        
        APICalls.GetSlideAudio(slideID).then( (data) => {
           data.blob().then ( responseBlob => {
               const objectURL = URL.createObjectURL(responseBlob);
               setSlideAudioURL(objectURL);
               setSlideAudioUpdating(false);
           })
        })
    }

    return (
        <div className = "courseListCard" key={slide.ID} >
            <SimpleCard  {...childProps}>
                <Link to={LinkAddress}>
                        <div>
                    {slide.SlideName}
                    </div>
                    
                    <Tooltip
                                content={<span>{slide.SlideText}</span>}
                                openOnTargetFocus={false}
                                usePortal={false}
                            >
                                ...
                    </Tooltip>
                </Link>
                <SimpleAudioPlayer audiofile = {slideAudioURL} updating = {slideAudioUpdating}/>

                <SlideDeleteButton 
                        ItemID = {slide.ID}
                        CourseID = {slide.CourseID}
                        ChapterID = {slide.ChapterID}
                        />
            </SimpleCard>
        </div>
    )
}