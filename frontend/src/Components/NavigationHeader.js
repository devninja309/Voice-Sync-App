//Basic Navigation Header
import * as React from "react";
import {Navbar, Alignment} from "@blueprintjs/core";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import { LinkButton } from "../Elements/LinkButton";
import { BackButton } from "./BackButton";
import { IsAdmin } from "../Hooks/Auth";


export function NavigationHeader () 
{
    const { user, isAuthenticated, isLoading } = useAuth0();


    // let isAdmin = false;
    // if (user) {
    //     isAdmin = user[`https://industryacademy.com//roles`].some(val => val == `Admin`);  //Would rather this be the permissions, but that's enough harder to get at it's not worth the time.

    // }

    const isAdmin = IsAdmin();

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
                        <LinkButton Link = '/courses' Text='Courses'/>
                        {isAdmin && <LinkButton Link = '/logs' Text='Logs'/>}
                        <LinkButton Link = '/AudioTest' Text='Audio Test Page'/>
                        </div>
                    }
            <Navbar.Divider />
                    <BackButton/>

        </Navbar.Group>
    </Navbar>

    </div>
    )
}