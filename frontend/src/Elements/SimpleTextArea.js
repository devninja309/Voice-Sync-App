//Simple button, base class for other buttons

import * as React from "react";

import { TextArea } from "@blueprintjs/core";


export function SimpleTextArea (props) 
{
    const {...childProps} = props;
    return  (  <TextArea {...childProps}/>
    )
}
