
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import {CreateProject} from '../Hooks/URLInterface'
import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../Elements/SimpleTextEntry";
import { SimpleTextArea } from "../Elements/SimpleTextArea";

import{useAuthTools} from '../Hooks/Auth';


export function ScriptCreateDialog (props) 
{
    var projectID = props.projectID;
    const navigate = useNavigate();
    
    const [scriptName, setScriptName] = React.useState(null);
    const [scriptText, setScriptText] = React.useState(null);

    const {token,APICalls} = useAuthTools();

    function AddScript(){
        APICalls.CreateScript({"scriptName":scriptName, "scriptText": scriptText, "projectID": projectID}).then(
            data => {
                navigate(`/projects/${projectID}/scripts/` + data.ID)
            }
         );
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new script</h3>
            <SimpleTextInput placeholder="Enter Script Name" onChange={event => setScriptName(event.target.value)}/>
            <hr/>
            <SimpleTextArea placeholder="Enter Script Text" onChange={event => setScriptText(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={AddScript} Text="Create Script"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}