
import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'

import {UglyPage} from './Pages/UglyPage'
import {LandingPage} from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import ProjectListPage from './Pages/ProjectListPage'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path ="/" element = {<LandingPage></LandingPage>}></Route>
          <Route path ="/Ugly" element = {<UglyPage></UglyPage>}></Route>
          <Route path ="/Login" element = {<LoginPage></LoginPage>}></Route>
          <Route path ="/Projects" element = {<ProjectListPage></ProjectListPage>}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
