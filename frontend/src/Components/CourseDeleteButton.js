
import * as React from "react";

import { DeleteButton } from "../Elements/DeleteButton";
import { Link } from "react-router-dom";
import{useAuthTools} from '../Hooks/Auth';

export function CourseDeleteButton (props) {
    const {token, APICalls} = useAuthTools();

    return (
            <DeleteButton        
                ItemType = 'course' 
                DeleteFunction = {APICalls.DeleteCourse}
                FinishedDestination = '/courses/' 
                {...props}
            />        
    )

}