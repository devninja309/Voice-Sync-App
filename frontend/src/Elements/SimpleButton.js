//Simple button, base class for other buttons

import * as React from "react";

import { Button } from "@blueprintjs/core";


export function SimpleButton (props) 
{
    return  (  <Button {...props}>
        {props.Text}
    </Button>
    )
}
