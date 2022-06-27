import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { SimpleButton } from "../Elements/SimpleButton";


export function LogoutButton (props) 
{
    const { logout } = useAuth0();

    return  (  <SimpleButton onClick={() => logout({ returnTo: window.location.origin })} Text = 'Log Out' {...props}/>)
}
