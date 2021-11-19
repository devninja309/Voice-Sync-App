//List of active projects
import { PageWrapper } from '../Components/PageWrapper';
import ProjectList from '../Components/ProjectList';
import { BigLogo } from '../Elements/Logos';

const ProjectListPage = (props) => {

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <BigLogo/>
            <p>
                
            </p>
            <ProjectList/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectListPage;