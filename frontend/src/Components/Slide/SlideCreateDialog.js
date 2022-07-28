
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { SimpleButton } from "../../Elements/SimpleButton";
import { SimpleDialog } from "../../Elements/SimpleDialog";

import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "../../Elements/SimpleTextEntry";
import { SimpleTextArea } from "../../Elements/SimpleTextArea";

import {ImportNewSlideText} from "../../Etc/TextManagement";

import{useAuthTools} from '../../Hooks/Auth';


export function SlideCreateDialog (props) 
{
    var CourseID = props.CourseID;
    var ChapterID = props.ChapterID;
    const navigate = useNavigate();
    
    const [slideName, setSlideName] = React.useState(null);
    const [slideText, setSlideText] = React.useState(null);

    const {APICalls} = useAuthTools();

    const {children, handleClose,nextSlideOrdinal, ...childProps} = props;

    function AddSlide(){
        let promise = ImportNewSlideText(ChapterID, slideName, 61137774, slideText,APICalls, nextSlideOrdinal)
        promise.then(
            data => {
                if (data != null)
                {
                    navigate(`/courses/${CourseID}/chapters/${ChapterID}/slides/` + data.ID)
                }
            }
         );
    }
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new slide</h3>
            <SimpleTextInput placeholder="Enter Slide Name" onChange={event => setSlideName(event.target.value)}/>
            <hr/>
            <SimpleTextArea placeholder="Enter Slide Text" onChange={event => setSlideText(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={AddSlide} Text="Create Slide"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}