
import * as React from "react";

import { DeleteButton } from "../Elements/DeleteButton";
import { Link } from "react-router-dom";
import{useAuthTools} from '../Hooks/Auth';

export function ChapterDeleteButton (props) {
    const {token, APICalls} = useAuthTools();
    const courseID = props.CourseID

    return (
            <DeleteButton        
                ItemType = 'chapter' 
                DeleteFunction = {APICalls.DeleteChapter}
                FinishedDestination = {'/courses/' + courseID }
                {...props}
            />        
    )

}