//Welcome to the app landing page
import React from "react";
import { PageWrapper } from '../Components/PageWrapper';
import {LinkButton} from '../Elements/LinkButton';
import { BigLogo } from "../Elements/Logos";
import { DBTest } from "../Elements/DBTest";

export function LandingPage () 
{
    return  (   
    <div> 
    <div className="App">
      <PageWrapper>
    <header className="App-header">
      <BigLogo/>
      
      <LinkButton Link = '/courses' Text='Courses'/>

    </header>
    </PageWrapper>
  </div>
  </div> 
    )
}