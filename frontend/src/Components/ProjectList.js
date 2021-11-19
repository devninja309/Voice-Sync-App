//List of projects in DB
import React from 'react';

import {GetProjects, getUrlPath} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { ProjectListCard } from './ProjectListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { ProjectCreateButton } from './ProjectCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function ProjectList (props) {


 const [projects, setProjects] = useState('');
 const {token,fetchWithAuth} = useAuthTools();
 
 useEffect( () => {
     GetProjects(token).then(
        data => {
            //setProjects(data);
        }
     )
    var path = getUrlPath('projects')
    fetchWithAuth(path)
    .then(response => response.json())
    .then(
             data => {
                 setProjects(data);
             })

 },[token, fetchWithAuth]);
 function DisplayProjectsList() {
    if (projects)
    {
        return projects.map(project => (<ProjectListCard key ={project.ID} ProjectID = {project.ID}> {project.ProjectName}</ProjectListCard>))
    }
    else {
    }
}
    return (
        <div className = "ProjectListBox"> 
        <ButtonGroup><h3>Projects</h3><ProjectCreateButton/>
        </ButtonGroup>
        {DisplayProjectsList()}
        </div>
    )
 }
