//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";



export function ScriptListCard (props) 
{
    const {script, ...childProps} = props;
    const LinkAddress = '/projects/' + script.ProjectID + '/scripts/' + script.ID
    return (
        <div className = "ProjectListCard" key={script.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
                <div>
            {script.ScriptName}
            </div>
            
            <Tooltip
                        content={<span>{script.ScriptText}</span>}
                        openOnTargetFocus={false}
                        usePortal={false}
                    >
                        ...
            </Tooltip>
            <PlayAudioClip audiofile = {script.MergedClip} />
            </SimpleCard>
        </Link>
        </div>
    )
}