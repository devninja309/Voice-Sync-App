//Simple button, base class for other buttons

import * as React from "react";
import {Tooltip} from "@blueprintjs/core";
import { ButtonGroup, Icon } from '@blueprintjs/core';

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";
import { IconButton } from '../Elements/IconButton'; 

export function ClipListCard (props) 
{
    const {clip, setSelectedClip, ...childProps} = props;
    //const LinkAddress = '/courses/' + script.CourseID + '/scripts/' + script.ID
    return (
        <div className = "div-ClipListCard" key={clip.ID} onClick={()=>setSelectedClip(clip)}>
            <SimpleCard  {...childProps} className="SimpleCard-ClipListCard">
                <div class="div-Slide-Details-Container">
                    <p class = "p-clip-card-text">
                        Clip: {clip.OrdinalValue}
                    </p>
                                           
                    <PlayAudioClip audiofile = {clip.AudioClip} />  
                    <IconButton icon="refresh"/>
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