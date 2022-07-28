
import * as React from "react";

import { DeleteButton } from "../../Elements/DeleteButton";
import{useAuthTools} from '../../Hooks/Auth';

export function ChapterDeleteButton (props) {
    const {APICalls} = useAuthTools();
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