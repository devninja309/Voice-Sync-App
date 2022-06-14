//List of active courses
import { PageWrapper } from '../Components/PageWrapper';
import LogList from '../Components/LogList';
import { MidLogo } from '../Elements/Logos';

const EventLogPage = (props) => {

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <MidLogo/>
            <p>
                
            </p>
            <LogList/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default EventLogPage;