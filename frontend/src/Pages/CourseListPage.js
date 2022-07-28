//List of active courses
import { PageWrapper } from '../Components/PageWrapper';
import CourseList from '../Components/Course/CourseList';
import { MidLogo } from '../Elements/Logos';

const CourseListPage = (props) => {

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <MidLogo/>
            <p>
                
            </p>
            <CourseList/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default CourseListPage;