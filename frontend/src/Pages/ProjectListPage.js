//List of active projects
import logo from '../logo.svg';
import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';

const ProjectListPage = () => {

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
 function whyunowork() {
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

    return  (     
        <div className="App">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                This is the Project List Page
            </p>
            { whyunowork()}
            
            </header>
        </div>
    )
}
export default ProjectListPage;