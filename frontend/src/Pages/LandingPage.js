//Welcome to the app landing page
import React from "react";
import {Link } from "react-router-dom";
import { PageWrapper } from '../Components/PageWrapper';
import { SimpleButton } from "../Elements/SimpleButton";
import logo from '../logo.svg';

export function LandingPage () 
{
    return  (   
    <div> 
    <div className="App">
      <PageWrapper>
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        This is the Landing Page
      </p>

      <Link to="/projects"><SimpleButton>
              Go to Projects
            </SimpleButton>
            </Link>
    </header>
    </PageWrapper>
  </div>
  </div> 
    )
}