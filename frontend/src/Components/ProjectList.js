//List of projects in DB

import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';

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
