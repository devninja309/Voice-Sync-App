//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";


export function LinkButton (props) 
{
    return (
        <Link to={props.Link}>
            <SimpleButton {...props}>
            </SimpleButton>
        </Link>
    )
}