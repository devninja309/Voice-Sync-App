//Simple button, base class for other buttons

import * as React from "react";

import { Icon , IconSize, Intent} from "@blueprintjs/core";


export function IconButton (props) 
{
    const { ...childProps} = props;
    return  (  <Icon className ="icon-button" size={IconSize.LARGE} intent={Intent.PRIMARY} {...props}>

    </Icon>
    )
}
