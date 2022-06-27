
import './App.css';
import React from 'react';
import {useState, useEffect} from 'react';
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";

import {LandingPage} from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import CourseListPage from './Pages/CourseListPage'
import CourseDetailsPage from './Pages/CourseDetailsPage'
import ChapterDetailsPage from './Pages/ChapterDetailsPage'
import SlideDetailsPage from './Pages/SlideDetailsPage'
import EventLogPage from './Pages/EventLogPage'
import PronunciationPage from './Pages/PronunciationPage'

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
          <Route path ="/Login" element = {<LoginPage/>}></Route>
          <Route path ="/courses" element = {<CourseListPage accessToken = {userToken}/>}></Route>
          <Route path ="/logs" element = {<EventLogPage/>}></Route>
          <Route path ="/pronunciations" element = {<PronunciationPage/>}></Route>
          <Route path ="/courses/:CourseID" element = {<CourseDetailsPage />}></Route>
          <Route path ="/courses/:CourseID/chapters/:ChapterID" element = {<ChapterDetailsPage />}></Route>
          <Route path ="/courses/:CourseID/chapters/:ChapterID/slides/:slideID" element = {<SlideDetailsPage />}></Route>
          <Route path ="/AudioTest" element = {<RawAudioTestPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
