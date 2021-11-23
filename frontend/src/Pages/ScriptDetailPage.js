//Page that loads when a narration is opened
//A narration should tie 1-1 with an original file.

//This should contain the original text file (uneditable) as well as a number of tabs(?) for broken up 
//Each tab should have a ClipEditControl
//This page should have a 'finish and generate master naration' button that gets all the clips , merges them, and exports them



//I'm still a copy of the project list screen
//List of active projects
import { PageWrapper } from '../Components/PageWrapper';
import ProjectList from '../Components/ProjectList';
import { BigLogo } from '../Elements/Logos';

const ScriptDetailsPage = (props) => {

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
export default ScriptDetailsPage;