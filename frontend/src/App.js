
import './App.css';
import React from 'react';
import {useState, useEffect} from 'react';
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";

import {UglyPage} from './Pages/UglyPage'
import {LandingPage} from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import ProjectListPage from './Pages/ProjectListPage'
import ProjectDetailsPage from './Pages/ProjectDetailsPage'
import ScriptDetailsPage from './Pages/ScriptDetailsPage'

import {GetUserToken} from './Etc/TokenManagement';
import { LogError, LogErrorMessage } from './Etc/ErrorHandler';
import { useAuthTools } from './Hooks/Auth';
import RawAudioTestPage from './Pages/RawAudioTestPage';


function App() {
  const useAuth0Data = useAuth0();
  const { isAuthenticated, isLoading } = useAuth0Data;
  const {setToken} = useAuthTools();
  const [userToken, setUserToken] = useState(null);

    useEffect(() => {
      const getUserToken = async () => {
        if (userToken != null) { return }
          if (isLoading) return;
          if (!isAuthenticated) return;

      try {
          const accessToken = await GetUserToken(useAuth0Data);
          setUserToken(accessToken);
          setToken(accessToken);
      } catch (e) {
          LogErrorMessage('failed to get userToken');
          LogError(e);
      }
      };

      getUserToken();
  }, );

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path ="/" element = {<LandingPage/>}></Route>
          <Route path ="/Ugly" element = {<UglyPage/>}></Route>
          <Route path ="/Login" element = {<LoginPage/>}></Route>
          <Route path ="/Projects" element = {<ProjectListPage accessToken = {userToken}/>}></Route>
          <Route path ="/Projects/:projectID" element = {<ProjectDetailsPage />}></Route>
          <Route path ="/Projects/:projectID/scripts/:scriptID" element = {<ScriptDetailsPage />}></Route>
          <Route path ="/AudioTest" element = {<RawAudioTestPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
