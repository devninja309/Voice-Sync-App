
import * as React from "react";

import { DeleteButton } from "../Elements/DeleteButton";
import{useAuthTools} from '../Hooks/Auth';

export function SlideDeleteButton (props) {
    const {APICalls} = useAuthTools();
    const courseID = props.CourseID
    const chapterID = props.ChapterID

    return (
            <DeleteButton        
                ItemType = 'slide' 
                DeleteFunction = {APICalls.DeleteSlide}
                FinishedDestination = {'/courses/' + courseID + '/chapters/' + chapterID}
                {...props}
            />        
    )

}