//List of scripts for a given course in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { ChapterListCard } from './ChapterListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { ChapterCreateButton } from './ChapterCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function ChapterList (props) {
     var CourseID = props.CourseID;


 const [chapters, setChapters] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetChapters(CourseID)
    .then(
        data => {
            setChapters(data);
        })

 },[token, CourseID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayChaptersList() {
    if (chapters)
    {
        return chapters.map(chapter => (<ChapterListCard key={chapter.ID} chapter = {chapter}/>))
    }
    else {
    }
}
    return (
        <div className = "courseListBox"> 
        <div className = 'info-row'><h3>Chapters </h3> <ButtonGroup height = '10px'><ChapterCreateButton CourseID = {CourseID}/>
        </ButtonGroup></div>
        {DisplayChaptersList()}
        </div>
    )
 }
