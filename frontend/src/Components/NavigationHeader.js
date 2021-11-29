//Basic Navigation Header
import * as React from "react";
import {Navbar, Alignment} from "@blueprintjs/core";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import { LinkButton } from "../Elements/LinkButton";


export function NavigationHeader () 
{
    const { user, isAuthenticated, isLoading } = useAuth0();

    const accountGroup = () => {
        if (isLoading) {
            return <p>Loading ...</p>;
          }
        if (isAuthenticated) {
            return (<div className = "InlineDivStyle">
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
                        <div>
                        <LinkButton Link = '/projects' Text='Projects'/>
                        <LinkButton Link = '/AudioTest' Text='Audio Test Page'/>
                        </div>
                    }

        </Navbar.Group>
    </Navbar>

    </div>
    )
}