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
     if (ChapterID) {
        APICalls.GetSlides(ChapterID)
        .then(
            data => {
                setSlides(data);
            })
    }

 },[token, ChapterID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 
 function slideSort(a,b) {
    if (a.OrdinalValue && b.OrdinalValue) {
        const val =  a.OrdinalValue - b.OrdinalValue;
        if (val === 0 ) {
           return a.ID - b.ID
        }
        else return val;
    }
    else return a.ID - b.ID
}
 
 function DisplaySlideList() {
    if (slides)
    {
        let data = [...slides];
        data.sort(slideSort);
        return data.sort(slideSort).map(slide => (<SlideListCard key={slide.ID} slide = {slide}/>))
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
