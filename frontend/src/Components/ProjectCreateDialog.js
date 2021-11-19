
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import {CreateProject} from '.././Etc/URLInterface'
import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../Elements/SimpleTextEntry";


export function ProjectCreateDialog (props) 
{
    const navigate = useNavigate();
    
    const [projectName, setProjectName] = React.useState(false);

    function AddProject(){
        console.log(projectName);
        CreateProject(props.accessToken,{"ProjectName":projectName}).then(
            data => {
                console.log(data);
                navigate('/projects/' + data.ID)
            }
        );
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new project</h3>
            <SimpleTextInput placeholder="Enter Project Name" onChange={event => setProjectName(event.target.value)}/>
            <ButtonGroup>
                <SimpleButton onClick={AddProject} Text="Create Project"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}