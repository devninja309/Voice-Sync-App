//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";



export function SlideListCard (props) 
{
    const {slide, ...childProps} = props;
    const LinkAddress = '/courses/' + slide.CourseID + '/chapters/' + slide.ChapterID + '/slides/' + slide.ID
    return (
        <div className = "courseListCard" key={slide.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
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
            <PlayAudioClip audiofile = {slide.MergedClip} />
            </SimpleCard>
        </Link>
        </div>
    )
}