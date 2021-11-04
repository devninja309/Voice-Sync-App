//List of active projects
import logo from '../logo.svg';
import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';

const ProjectListPage = () => {

 const [projects, setProjects] = useState('');
 useEffect( () => {
     GetProjects().then(
        data => {
            console.log(data);
            setProjects(data);
        }
     )
     //.then(data => {
     //   console.log("Data : " + data);
     //   setProjects(data);
     //})
 },[]);

    return  (     
        <div className="App">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                This is the Project List Page
            </p>
            {projects.map(projectName => (<p> {projectName}</p>))}
            </header>
        </div>
    )
}
export default ProjectListPage;