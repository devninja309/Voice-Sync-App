//Simple Loading Spinner

import * as React from "react";

import { Spinner } from "@blueprintjs/core";


export function LoadingSpinner (props) 
{
    const {Text, ...childProps} = props;
    return  (  <Spinner {...childProps}/>
    )
}
