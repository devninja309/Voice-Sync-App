//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";

export function ClipListCard (props) 
{
    const {clip, setSelectedClip, ...childProps} = props;
    //const LinkAddress = '/courses/' + script.CourseID + '/scripts/' + script.ID
    return (
        <div className = "ClipListCard" key={clip.ID} onClick={()=>setSelectedClip(clip)}>
            <SimpleCard  {...childProps}>
                <div>
                    <p class = "p-clip-card-text">
                        Clip: {clip.ID}
                    </p>
                </div>
                
                <Tooltip
                            content={<span>{clip.ClipText}</span>}
                            openOnTargetFocus={false}
                            usePortal={false}
                        >
                            ...
                </Tooltip>
                <PlayAudioClip audiofile = {clip.AudioClip} />
            </SimpleCard>
        </div>
    )
}