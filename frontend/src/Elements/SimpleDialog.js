import { Dialog } from "@blueprintjs/core";
import * as React from "react";



export function SimpleDialog (props) 
{
    const {children, ...childProps} = props;
    return  (  
        <Dialog className="SimpleDialog" {...childProps}>
        {children}       
        </Dialog>
    )
}