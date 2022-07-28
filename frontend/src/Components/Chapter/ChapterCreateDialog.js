
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../Elements/SimpleTextEntry";

import{useAuthTools} from '../Hooks/Auth';


export function ChapterCreateDialog (props) 
{
    var CourseID = props.CourseID;
    const navigate = useNavigate();
    
    const [chapterName, setChapterName] = React.useState(false);

    const { APICalls} = useAuthTools();

    function AddChapter(){
        APICalls.CreateChapter({"ChapterName":chapterName, "CourseID": CourseID}).then(
            data => {
                navigate(`/courses/${CourseID}/chapters/` + data.ID)
            }
        );
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new course</h3>
            <SimpleTextInput placeholder="Enter Chapter Name" onChange={event => setChapterName(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={AddChapter} Text="Create Chapter"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}