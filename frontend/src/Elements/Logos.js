//Welcome to the app landing page
import React from "react";
//import logo from 'ia_logo_trans.png';
const logo = '/ia_logo_trans.png';

export function SmallLogo () 
{
    return  (   
      <img src={logo} className="App-logo.small" alt="logo" />
    )
}
export function MidLogo () 
{
    return  (   
      <img src={logo} className="App-logo.mid" alt="logo" />
    )
}
export function BigLogo () 
{
    return  (  
        <div className="App-logo-background">
            <img src={logo} className="App-logo.big" alt="logo" />
      </div> 
    )
}