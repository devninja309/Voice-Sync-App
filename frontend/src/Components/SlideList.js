//List of scripts for a given course in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { SlideListCard } from './SlideListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { SlideCreateButton } from './SlideCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function SlideList (props) {
    var ChapterID = props.ChapterID;
    var CourseID = props.CourseID;


 const [slides, setSlides] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetSlides(ChapterID)
    .then(
        data => {
            setSlides(data);
        })

 },[token, ChapterID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplaySlideList() {
    if (slides)
    {
        return slides.sort((a,b) => {return a.OrdinalValue < b.OrdinalValue}).map(slide => (<SlideListCard key={slide.ID} slide = {slide}/>))
    }
    else {
    }
}
    return (
        <div className = "courseListBox"> 
        <div className = 'info-row'><h3>Slides </h3> <ButtonGroup height = '10px'><SlideCreateButton CourseID = {CourseID} ChapterID = {ChapterID}/>
        </ButtonGroup></div>
        {DisplaySlideList()}
        </div>
    )
 }
