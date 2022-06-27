import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { SimpleButton } from "../Elements/SimpleButton";


export function LoginButton (props) 
{
    const { loginWithRedirect } = useAuth0();

    return  (  <SimpleButton onClick={() => loginWithRedirect()} Text = 'Log In' {...props}/>)
}
