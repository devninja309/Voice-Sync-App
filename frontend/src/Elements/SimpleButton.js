//Simple button, base class for other buttons

import * as React from "react";

import { Button } from "@blueprintjs/core";


export function SimpleButton (props) 
{
    const {Text, ...childProps} = props;
    return  (  <Button className = 'button-Simple' {...childProps}>
        {Text}
    </Button>
    )
}
