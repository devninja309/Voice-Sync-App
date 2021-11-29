//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";
import {Tooltip} from "@blueprintjs/core";

import { SimpleCard } from "../Elements/SimpleCard";
import {PlayAudioClip} from "./PlayAudioClip";



export function ScriptListCard (props) 
{
    const {script, ...childProps} = props;
    const LinkAddress = '/projects/' + script.projectID + '/scripts/' + script.ID
    return (
        <div className = "ProjectListCard" key={script.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
            {script.ScriptName}
            
            <Tooltip
                        content={<span>Full text of the script goes here!</span>}
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