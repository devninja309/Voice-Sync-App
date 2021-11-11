//Basic Navigation Header
import * as React from "react";
import {useState, useEffect} from 'react';
import {ButtonGroup, Divider} from "@blueprintjs/core";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import Config from "../config.json";


export function NavigationHeader () 
{
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [userMetadata, setUserMetadata] = useState(null);

    const accountGroup = () => {
        if (isLoading) {
            return <div>Loading ...</div>;
          }
        if (isAuthenticated) {
            console.log(user);
            return (<div>
                <p>{user.name}</p>
                {userMetadata ? (
                    <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
                    ) : (
                    "No user metadata defined"
                    )}
                <LogoutButton/>
                </div>
            )
        }
        return <LoginButton/>

    }


useEffect(() => {
    const getUserMetadata = async () => {
        if (isLoading) return;
        if (!isAuthenticated) return;
      const domain = "dev-l3ao-nin.us.auth0.com"; 
      console.log('Getting userdata');
  
      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: "read:current_user",
        });
        console.log('AccessToken');
        console.log(accessToken);
  
        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;
  
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const { user_metadata } = await metadataResponse.json();
  
        setUserMetadata(user_metadata);
      } catch (e) {
          console.log('failed to get usermetadata');
        console.log(e.message);
      }
    };
  
    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);


    return  (  <div>
        <ButtonGroup fill = 'true'>
            <Divider/>
            {accountGroup()}
            <Divider/>
        </ButtonGroup>

    </div>
    )
}