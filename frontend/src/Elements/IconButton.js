//Simple button, base class for other buttons

import * as React from "react";

import { Icon , IconSize, Intent} from "@blueprintjs/core";


export function IconButton (props) 
{
    const {disabled, onClick, ...childProps} = props ;
    if (!disabled)
    {
        return  (  <Icon className ="icon-button" size={IconSize.LARGE} intent={Intent.PRIMARY} onClick = {onClick} {...childProps}/>)
    }
    else return (  <Icon className ="icon-button" size={IconSize.LARGE} intent={Intent.WARNING} {...childProps}/>)

}
