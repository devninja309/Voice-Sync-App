//Welcome to the app landing page
import React from "react";
import { PageWrapper } from '../Components/PageWrapper';
import {LinkButton} from '../Elements/LinkButton';
import { BigLogo } from "../Elements/Logos";

export function LandingPage () 
{
    return  (   
    <div> 
    <div className="App">
      <PageWrapper>
    <header className="App-header">
      <BigLogo/>
      
      <LinkButton Link = '/projects' Text='Projects'/>

    </header>
    </PageWrapper>
  </div>
  </div> 
    )
}