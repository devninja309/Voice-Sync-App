//Simple button, base class for other buttons

import * as React from "react";

import { IconButton } from "../Elements/IconButton";
import { useNavigate, useLocation} from "react-router-dom";


export function BackButton (props) 
{
    const navigate = useNavigate();
    const currentLocation = useLocation();

    const address = currentLocation.pathname.slice(0,-1).split(`/`).slice(0,-2).join('/');

    function Back() {
        if (address === "") {
            navigate ('/courses')
        }
        else {
            navigate(address);
        }
    }

    return  (  <IconButton onClick={() => Back()} icon='direction-left' {...props}/>)
}
