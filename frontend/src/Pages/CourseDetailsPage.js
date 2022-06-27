//Page that loads when a course is opened
//This should contain extended course information, including a list of narrations

//List of active courses
import {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import{useAuthTools} from '../Hooks/Auth';

import ChapterList from '../Components/ChapterList';
import { MidLogo } from '../Elements/Logos';

//useparams here react-router-dom

const CourseDetailsPage = (props) => {
    const CourseID =useParams().CourseID;

    const [course, setcourse] = useState('');
    const {token, APICalls} = useAuthTools();
    
    useEffect( () => {
        APICalls.GetCourseDetails(CourseID)
        .then(
            data => {
                console.log(data)
            })
    
     },[token, CourseID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
     

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <MidLogo/>
            <div className ="course-Name-Box">
            <h3>
            {course.CourseName}
            </h3>
            <hr width='80%'/>
            <p  className ="p-course-Description" >
            Course Description goes here.  A course is conceptually a single class.  It might have many chapters (arbitrary groups) and slides (final output file) underneath it    
            </p>
            </div>
            <ChapterList CourseID = {CourseID}></ChapterList>           
            </header>
        </div>
        </PageWrapper>
    )
}
export default CourseDetailsPage;