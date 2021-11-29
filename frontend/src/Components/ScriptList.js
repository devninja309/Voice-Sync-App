//List of scripts for a given project in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { ScriptListCard } from './ScriptListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { ScriptCreateButton } from './ScriptCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function ScriptList (props) {
     var projectID = props.projectID;


 const [scripts, setScripts] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetScripts(projectID)
    .then(
        data => {
            setScripts(data);
        })

 },[token, projectID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayScriptsList() {
    if (scripts)
    {
        return scripts.map(script => (<ScriptListCard key={script.ID} script = {script}/>))
    }
    else {
    }
}
    return (
        <div className = "ProjectListBox"> 
        <ButtonGroup><h3>Scripts</h3><ScriptCreateButton/>
        </ButtonGroup>
        {DisplayScriptsList()}
        </div>
    )
 }
