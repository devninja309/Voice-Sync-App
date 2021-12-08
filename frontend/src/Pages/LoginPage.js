import React from "react";
import { LoginButton } from "../Components/LoginButton";
import { PageWrapper } from "../Components/PageWrapper";


import logo from '../logo.svg';

const LoginPage = () => {



  return  (     
    <PageWrapper>
    <div className="App">
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
            This is the course Login Page
        </p>
        <LoginButton/>
        </header>
    </div>
    </PageWrapper>
)};


export default LoginPage;