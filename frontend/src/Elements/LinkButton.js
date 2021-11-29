//Simple button, base class for other buttons

import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleButton } from "../Elements/SimpleButton";


export function LinkButton (props) 
{
    const {Link: LinkAddress, ...childProps} = props;
    return (
        <Link to={LinkAddress} className="button-Link">
            <SimpleButton {...childProps}>
            </SimpleButton>
        </Link>
    )
}