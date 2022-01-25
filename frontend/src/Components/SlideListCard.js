//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";

import {SlideDeleteButton} from "./SlideDeleteButton";



export function SlideListCard (props) 
{
    const {slide, ...childProps} = props;
    const LinkAddress = '/courses/' + slide.CourseID + '/chapters/' + slide.ChapterID + '/slides/' + slide.ID
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
                <PlayAudioClip audiofile = {slide.MergedClip} />

                <SlideDeleteButton 
                        ItemID = {slide.ID}
                        CourseID = {slide.CourseID}
                        ChapterID = {slide.ChapterID}
                        />
            </SimpleCard>
        </div>
    )
}