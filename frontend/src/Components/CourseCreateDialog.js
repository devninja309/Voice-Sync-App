
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../Elements/SimpleTextEntry";

import{useAuthTools} from '../Hooks/Auth';


export function CourseCreateDialog (props) 
{
    const navigate = useNavigate();
    
    const [courseName, setcourseName] = React.useState(false);

    const { APICalls} = useAuthTools();

    function Addcourse(){
        APICalls.Createcourse({"CourseName":courseName}).then(
            data => {
                navigate('/courses/' + data.ID)
            }
        );
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new course</h3>
            <SimpleTextInput placeholder="Enter Course Name" onChange={event => setcourseName(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={Addcourse} Text="Create course"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}