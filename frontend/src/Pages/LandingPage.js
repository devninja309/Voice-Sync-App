//Welcome to the app landing page

import logo from '../logo.svg';

export function LandingPage () 
{
    return  (   
    <div> 
    <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        This is the Landing Page
      </p>
    </header>
  </div>
  </div> 
    )
}