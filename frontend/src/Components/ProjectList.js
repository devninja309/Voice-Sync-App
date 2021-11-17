//List of projects in DB

import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { ProjectListCard } from './ProjectListCard';

 export default function ProjectList (props) {

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
        console.log('No projects :(')
    }
}
    
    return (
        <div>
        {DisplayProjectsList()}
        </div>
    )
 }
