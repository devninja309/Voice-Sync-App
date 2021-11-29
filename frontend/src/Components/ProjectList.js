//List of projects in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { ProjectListCard } from './ProjectListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { ProjectCreateButton } from './ProjectCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function ProjectList (props) {


 const [projects, setProjects] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetProjects()
    .then(
        data => {
            setProjects(data);
        })

 },[token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayProjectsList() {
    if (projects)
    {
        return projects.map(project => (<ProjectListCard key={project.ID} project = {project}/>))
    }
    else {
    }
}
    return (
        <div className = "ProjectListBox"> 
        <div className = 'info-row'><h3>Projects</h3><ButtonGroup><ProjectCreateButton/>
        </ButtonGroup></div>
        {DisplayProjectsList()}
        </div>
    )
 }
