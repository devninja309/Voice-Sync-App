//List of courses in DB
import React from 'react';

import {useState, useEffect} from 'react';
import { CourseListCard } from './CourseListCard';
import { ButtonGroup } from '@blueprintjs/core';
import { CourseCreateButton } from './CourseCreateButton';

import{useAuthTools} from '../Hooks/Auth';

 export default function CourseList (props) {


 const [courses, setCourses] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetCourses()
    .then(
        data => {
            setCourses(data);
        })
    

 },[token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayCoursesList() {
    if (courses)
    {
        return courses.map(course => (<CourseListCard key={course.ID} course = {course}/>))
    }
    else {
    }
}
    return (
        <div className = "courseListBox"> 
        <div className = 'info-row'><h3>Courses</h3><ButtonGroup><CourseCreateButton/>
        </ButtonGroup></div>
        {DisplayCoursesList()}
        </div>
    )
 }
