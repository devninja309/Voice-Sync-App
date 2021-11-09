import React from "react";
import { useAuth0 } from "@auth0/auth0-react";


import logo from '../logo.svg';

const LoginPage = () => {

    const { loginWithRedirect } = useAuth0();


  return  (     
    <div className="App">
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
            This is the Project Login Page
        </p>
        <button onClick={() => loginWithRedirect()}>Log In</button>
        
        </header>
    </div>
)};


export default LoginPage;