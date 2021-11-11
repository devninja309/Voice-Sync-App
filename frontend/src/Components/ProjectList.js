//List of projects in DB

import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { PageWrapper } from '../Components/PageWrapper';

 export default function ProjectList () {

 const [projects, setProjects] = useState('');
 
 useEffect( () => {
     GetProjects().then(
        data => {
            console.log('Getting Data')
            console.log(data);
            setProjects(data);
        }
     )
 },[]);
 function DisplayProjectsList() {
    if (projects)
    {
        console.log('Projects!');
        console.log(projects);
        return projects.map(project => (<p key ={project.ID}> {project.ProjectName}</p>))
    }
    else {
        console.log('No projects :(')
    }
}
    
    return (
        <div>
        {DisplayProjectsList()}
        </div>
    )
 }
