//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";
import ProjectListPage from "../Pages/ProjectListPage";



export function ProjectListCard (props) 
{
    const {ProjectID, ...childProps} = props;
    const LinkAddress = '/projects/' + ProjectID
    return (
        <Link to={LinkAddress}>
            <SimpleCard {...childProps}>
            </SimpleCard>
        </Link>
    )
}