//Page that loads when a project is opened
//This should contain extended project information, including a list of narrations


//I'm still a copy of the project list screen
//List of active projects
import {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import{useAuthTools} from '../Hooks/Auth';

import ScriptList from '../Components/ScriptList';

//useparams here react-router-dom

const ProjectDetailsPage = (props) => {
    const projectID =useParams().projectID;

    const [project, setProject] = useState('');
    const {token, APICalls} = useAuthTools();
    
    useEffect( () => {
        APICalls.GetProjectDetails(projectID)
        .then(
            data => {
                setProject(data[0]); //TODO Query organization doesn't support single responses.  Do we care?
            })
    
     },[token, projectID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
     

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <h3>
            {project.ProjectName}
            </h3>
            <p>
            Project Description goes here.  A project is conceptually a single class.  It might have many scripts (final output file) underneath it    
            </p>
            <ScriptList projectID = {projectID}></ScriptList>           
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectDetailsPage;