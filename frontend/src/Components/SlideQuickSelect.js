//This is meant to be a control that displays all the slides in a chapter in quickselect format

import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import{useAuthTools} from '../Hooks/Auth';

export function SlideQuickSelect (props) 
{
    const {Columns, ChapterID, ...childProps} = props;

    const [slideList, setSlideList] = useState(null);
    const {token, APICalls} = useAuthTools();

    const array = Array.from({length: Columns}, (_, index) => index);

    useEffect( () => {
        APICalls.GetSlides(ChapterID)
        .then(
            data => {
                setSlideList(data); 
                console.log(data);
            })    
     },[token, ChapterID]); 

     if (!slideList)
     {
         return (<div></div>)
     }
    

    function drawColumn(index, ColumnCount) {
        return (
        <div className="div-SlideQuickSelectColumn">
            {slideList.sort((a,b) => {return a.OrdinalValue < b.OrdinalValue}).map((slide, slideNum) => {
                const LinkAddress = '/courses/' + slide.CourseID + '/chapters/' + slide.ChapterID + '/slides/' + slide.ID
                const item = ((slideNum)%ColumnCount == index) ? (<Link to={LinkAddress}><p>{slide.SlideName}</p></Link>) : '';
                return item;
            })}
        </div>
        )
    }
    console.log(array);
    return (
    <div className ="div-SlidQuickSelectContainer">
        {array.map((ColumnIndex) => {
            return (
                drawColumn(ColumnIndex, Columns)
            )
        })}
    </div>
    )
}