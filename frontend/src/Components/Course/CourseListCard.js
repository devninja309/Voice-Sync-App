
import * as React from "react";
import { Link } from "react-router-dom";
import { CourseDeleteButton } from "./CourseDeleteButton";

import { SimpleCard } from "../../Elements/SimpleCard";



export function CourseListCard (props) 
{
    const {course, ...childProps} = props;
    const LinkAddress = '/courses/' + course.ID
    return (
        <div className = "courseListCard" key={course.ID} >
            <SimpleCard  {...childProps}>
                <Link to={LinkAddress}>
                    {course.CourseName}
                </Link>
                <CourseDeleteButton 
                    ItemID = {course.ID}
                    />
            </SimpleCard>
        </div>
    )
}