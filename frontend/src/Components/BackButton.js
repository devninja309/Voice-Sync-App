//Simple button, base class for other buttons

import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { IconButton } from "../Elements/IconButton";
import { useNavigate, useLocation} from "react-router-dom";
import { ELEVATION_0 } from "@blueprintjs/core/lib/esm/common/classes";


export function BackButton (props) 
{
    const navigate = useNavigate();
    const currentLocation = useLocation();

    const address = currentLocation.pathname.slice(0,-1).split(`/`).slice(0,-2).join('/');
    console.log(currentLocation.pathname)
    console.log(address);

    function Back() {
        if (address == "") {
            navigate ('/courses')
        }
        else {
            navigate(address);
        }
    }

    return  (  <IconButton onClick={() => Back()} icon='direction-left' {...props}/>)
}
