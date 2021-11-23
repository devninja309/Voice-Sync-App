//Page that loads when a project is opened
//This should contain extended project information, including a list of narrations


//I'm still a copy of the project list screen
//List of active projects
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import { BigLogo } from '../Elements/Logos';
import ScriptList from '../Components/ScriptList';

//useparams here react-router-dom

const ProjectDetailsPage = (props) => {
    const project =useParams().project;

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <h3>
            {project.projectName}
            </h3>
            <p>
                
            </p>
            <ScriptList></ScriptList>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectDetailsPage;