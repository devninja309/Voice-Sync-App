import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";
import { useState, useEffect } from 'react';

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

    function parseSlideName() {
        //remove illegal file name characters, then grab first 10 letters
        let newSlideName = slide.SlideName.replace(/[\/|\\:*?"<>]/g, '').slice(0,11);
        return newSlideName;
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
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{width: '100%', alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
                <SimpleAudioPlayer audiofile = {slideAudioURL} updating = {slideAudioUpdating} objectURL = {parseSlideName()} typeString = {"Slide"} isWideStyle = {true}/>
                </div></div>

                <SlideDeleteButton 
                        ItemID = {slide.ID}
                        CourseID = {slide.CourseID}
                        ChapterID = {slide.ChapterID}
                        />
            </SimpleCard>
        </div>
    )
}