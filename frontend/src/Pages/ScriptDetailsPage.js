//Page that loads when a narration is opened
//A narration should tie 1-1 with an original file.

//This should contain the original text file (uneditable) as well as a number of tabs(?) for broken up 
//Each tab should have a ClipEditControl
//This page should have a 'finish and generate master naration' button that gets all the clips , merges them, and exports them



//I'm still a copy of the project list screen
//List of active projects
import {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import{useAuthTools} from '../Hooks/Auth';
import { BigLogo } from '../Elements/Logos';

const ScriptDetailsPage = (props) => {

    const projectID =useParams().projectID;
    const scriptID =useParams().scriptID;

    const [script, setScript] = useState('');
    const {token, APICalls} = useAuthTools();
    
    useEffect( () => {
        // APICalls.GetScriptDetails(projectID)
        // .then(
        //     data => {
        //         setScript(data[0]); //TODO Query organization doesn't support single responses.  Do we care?
        //     })
    
     },[token, projectID, scriptID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
     


    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <BigLogo/>
            <p>
                This is the script details page.
                It will have a page for the main script.
                It will have tabs for the 'clips', i.e. each sentence.
                It will have a generate audio clip button for each sentence.  
                It will have a generate full audio clip for all sentences, merging them together 
                    and exporting a copy to the IA shared folder. 
            </p>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ScriptDetailsPage;