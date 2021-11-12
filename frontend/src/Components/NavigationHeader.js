//Basic Navigation Header
import * as React from "react";
import {useState, useEffect} from 'react';
import {ButtonGroup, Divider} from "@blueprintjs/core";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";


export function NavigationHeader () 
{
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    const accountGroup = () => {
        if (isLoading) {
            return <div>Loading ...</div>;
          }
        if (isAuthenticated) {
            console.log(user);
            return (<div>
                <p>{user.name}</p>
                <LogoutButton/>
                </div>
            )
        }
        return <LoginButton/>

    }
    return  (  <div>
        <ButtonGroup fill = 'true'>
            <Divider/>
            {accountGroup()}
            <Divider/>
        </ButtonGroup>

    </div>
    )
}