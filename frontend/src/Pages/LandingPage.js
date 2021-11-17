//Welcome to the app landing page
import React from "react";
import {Link } from "react-router-dom";
import { PageWrapper } from '../Components/PageWrapper';
import {LinkButton} from '../Elements/LinkButton';
import { BigLogo } from "../Elements/Logos";
import logo from '../logo.svg';

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