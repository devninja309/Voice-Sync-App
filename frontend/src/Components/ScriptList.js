//List of projects in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { ProjectListCard } from './ProjectListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { ProjectCreateButton } from './ProjectCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function ScriptList (props) {


 const [scripts, setScripts] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetScripts()
    .then(
        data => {
            setScripts(data);
        })

 },[token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayScriptsList() {
    if (scripts)
    {
        return scripts.map(script => (<ProjectListCard key={script.ID} script = {script}/>))
    }
    else {
    }
}
    return (
        <div className = "ProjectListBox"> 
        <ButtonGroup><h3>Projects</h3><ProjectCreateButton/>
        </ButtonGroup>
        {DisplayScriptsList()}
        </div>
    )
 }
