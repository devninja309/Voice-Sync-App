
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import {CreateProject} from '../Hooks/URLInterface'
import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../Elements/SimpleTextEntry";

import{useAuthTools} from '../Hooks/Auth';


export function ScriptCreateDialog (props) 
{
    const navigate = useNavigate();
    
    const [scriptName, setScriptName] = React.useState(false);

    const {token,APICalls} = useAuthTools();

    function AddScript(){
        console.log(scriptName);
        // APICalls.CreateProject({"ProjectName":projectName}).then(
        //     data => {
        //         console.log(data);
        //         navigate('/projects/' + data.ID)
        //     }
        // );
        alert("Script Creation Action!");
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new script</h3>
            <SimpleTextInput placeholder="Enter Script Name" onChange={event => setScriptName(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={AddScript} Text="Create Script"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}