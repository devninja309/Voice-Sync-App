//Basic Page Wrapper
//This is the basic form for all normal pages.  If you've got a normal page, wrap it in this

import * as React from "react";
import { NavigationHeader } from "./NavigationHeader";

export function PageWrapper (props) 
{
    return  (  <div>
        <NavigationHeader/>
        {props.children}
    </div>
    )
}