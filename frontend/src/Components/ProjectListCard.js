//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";



export function ProjectListCard (props) 
{
    const {project, ...childProps} = props;
    const LinkAddress = '/projects/' + project.ID
    return (
        <div className = "ProjectListCard" key={project.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
            {project.ProjectName}
            </SimpleCard>
        </Link>
        </div>
    )
}