
//CSS Files
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";
import {AuthProvider} from './Hooks/Auth'


ReactDOM.render(
  <React.StrictMode>
  <Auth0Provider
    domain="dev-l3ao-nin.us.auth0.com"
    clientId="QBRCxM8VfOqAvDzEOhOyP3uuywimKAUD"
    redirectUri={window.location.origin}
    audience="VoiceSynthManagerBackend"
    scope="read:courses edit:courses"
  >
    <AuthProvider>
    <App />
    </AuthProvider>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
