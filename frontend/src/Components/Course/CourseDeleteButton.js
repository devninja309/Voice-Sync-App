
import * as React from "react";

import { DeleteButton } from "../Elements/DeleteButton";
import{useAuthTools} from '../Hooks/Auth';

export function CourseDeleteButton (props) {
    const {APICalls} = useAuthTools();

    return (
            <DeleteButton        
                ItemType = 'course' 
                DeleteFunction = {APICalls.DeleteCourse}
                FinishedDestination = '/courses/' 
                {...props}
            />        
    )

}