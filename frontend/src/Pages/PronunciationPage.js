//List of active courses
import { PageWrapper } from '../Components/PageWrapper';
import PronunciationList from '../Components/PronunciationList';
import { BigLogo, MidLogo } from '../Elements/Logos';

const PronunciationListPage = (props) => {

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <MidLogo/>
            <p>
                
            </p>
            <PronunciationList/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default PronunciationListPage;