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
            })    
     },[token, ChapterID]); 

     if (!slideList)
     {
         return (<div></div>)
     }

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
    

    function drawColumn(index, ColumnCount) {
        let data = [...slideList];
        data = [...data.sort(slideSort)];
        return (
        <div className="div-SlideQuickSelectColumn">
            {data.map((slide, slideNum) => {
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