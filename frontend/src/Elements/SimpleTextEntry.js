import * as React from "react";

import { InputGroup } from "@blueprintjs/core";


export function SimpleTextInput (props) 
{
    const {...childProps} = props;
    return  (  <InputGroup {...childProps}/>
    )
}
