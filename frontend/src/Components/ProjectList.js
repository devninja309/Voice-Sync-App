//List of projects in DB
import React from 'react';
import { useNavigate } from "react-router-dom";

import {GetProjects,CreateProject} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { ProjectListCard } from './ProjectListCard';
import { SimpleButton} from '../Elements/SimpleButton';
import { ButtonGroup } from '@blueprintjs/core';

 export default function ProjectList (props) {

    const navigate = useNavigate();

 const [projects, setProjects] = useState('');
 
 useEffect( () => {
     GetProjects(props.accessToken).then(
        data => {
            setProjects(data);
        }
     )
 },[props.accessToken]);
 function DisplayProjectsList() {
    if (projects)
    {
        return projects.map(project => (<ProjectListCard key ={project.ID} ProjectID = {project.ID}> {project.ProjectName}</ProjectListCard>))
    }
    else {
    }
}
function AddProject(){
    //ToDo wrap this is a modal to get the project name
    CreateProject(props.accessToken,{"ProjectName":"NewProjectButtonProject"}).then(
        data => {
            navigate('/projects/' + data.ID)
        }
    );
    //ToDo Have this redirect to the project page
}
    
    return (
        <div className = "ProjectListBox"> 
        <ButtonGroup><h3>Projects</h3><SimpleButton icon="cube-add" onClick={AddProject}></SimpleButton></ButtonGroup>
        {DisplayProjectsList()}
        </div>
    )
 }
