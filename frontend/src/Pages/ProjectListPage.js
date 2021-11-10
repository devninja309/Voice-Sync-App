//List of active projects
import logo from '../logo.svg';
import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { PageWrapper } from '../Components/PageWrapper';

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

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                This is the Project List Page
            </p>
            { DisplayProjectsList()}
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectListPage;