import * as React from "react";

import { TextArea } from "@blueprintjs/core";


export function SimpleTextArea (props) 
{
    return  (  <TextArea growVertically={true} fill={true} {...props}/>
    )
}
