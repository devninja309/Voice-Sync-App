//This is meant to be a control that displays all the slides in a chapter in quickselect format

import {useState, useEffect} from 'react';
import { QuickSelect } from '../Elements/QuickSelect';
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
     function LinkAddressGenerator(slide) {
        var link =  '/courses/' + slide.CourseID + '/chapters/' + slide.ChapterID + '/slides/' + slide.ID  ; 
        return link       
     }
     function RowTitleSelector(slide) {
         return slide.SlideName;
     }
    
     return <QuickSelect
        Columns = {Columns}
        Rows = {slideList}
        Sort = {slideSort}
        LinkAddressGenerator = {LinkAddressGenerator}
        RowTitleSelector = {RowTitleSelector}
     />;
}