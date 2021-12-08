
import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";



export function CourseListCard (props) 
{
    const {course, ...childProps} = props;
    const LinkAddress = '/courses/' + course.ID
    return (
        <div className = "courseListCard" key={course.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
            {course.CourseName}
            </SimpleCard>
        </Link>
        </div>
    )
}