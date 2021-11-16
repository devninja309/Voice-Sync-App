//Basic Navigation Header
import * as React from "react";
import {useState, useEffect} from 'react';
import {ButtonGroup, Divider, Navbar, Alignment} from "@blueprintjs/core";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import { LinkButton } from "../Elements/LinkButton";


export function NavigationHeader () 
{
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    //TODO Move to CSS
    const divStyle = {
        display: 'flex',
        'flex-direction': 'row',
      };

    const accountGroup = () => {
        if (isLoading) {
            return <p>Loading ...</p>;
          }
        if (isAuthenticated) {
            console.log(user);
            return (<div style = {divStyle}>
                <Navbar.Heading>{user.name} </Navbar.Heading>
                <LogoutButton/>
                </div>
            )
        }
        return <LoginButton/>

    }
    return  (  <div>
    <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Voice Synth</Navbar.Heading>
            <Navbar.Divider />
                    {accountGroup()}
            <Navbar.Divider />
                    {isAuthenticated && 
                        <LinkButton Link = '/projects' Text='Projects'/>
                    }

        </Navbar.Group>
    </Navbar>

    </div>
    )
}