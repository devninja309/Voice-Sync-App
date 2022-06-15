//Page that loads when a course is opened
//This should contain extended course information, including a list of narrations


import {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import{useAuthTools} from '../Hooks/Auth';

import SlideList from '../Components/SlideList';
import { ChapterQuickSelect } from '../Components/ChapterQuickSelect';
import { MidLogo } from '../Elements/Logos';
import { LoadingSpinner } from '../Elements/LoadingSpinner';
import { ChapterDownloadAllClipsButton } from '../Components/ChapterDownloadAllClipsButton';

//useparams here react-router-dom

const ChapterDetailsPage = (props) => {
    const ChapterID =useParams().ChapterID;
    const CourseID =useParams().CourseID;

    const [chapter, setChapter] = useState({ChapterName:'Not Loaded'});
    const {token, APICalls} = useAuthTools();
    
    useEffect( () => {
        APICalls.GetChapterDetails(ChapterID)
        .then(
            data => {
                console.log('Chapter Data')
                setChapter(data); 
            })
    
     },[token, ChapterID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
     
     if (!chapter.ID) {
         return (<LoadingSpinner/>)
     }

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
                <div class="div-SlideHeader">
                    <div style={{width: '40%'}}>
                    <div><MidLogo/></div>
                    </div>
                    <div style={{width: '40%'}}>
                        <ChapterQuickSelect Columns={3} CourseID={CourseID}/>
                    </div>
                </div>
            <div className ="course-Name-Box">
            <h3>
            {chapter.ChapterName}
            </h3>
            <ChapterDownloadAllClipsButton/>
            <hr width='80%'/>
            </div>
            <SlideList CourseID = {CourseID} ChapterID = {ChapterID}></SlideList>           
            </header>
        </div>
        </PageWrapper>
    )
}
export default ChapterDetailsPage;