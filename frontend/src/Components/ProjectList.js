//List of projects in DB

import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';

 export default function ProjectList (props) {

 const [projects, setProjects] = useState('');
 
 useEffect( () => {
     GetProjects(props.accessToken).then(
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
