//This is meant to be a control that displays all the slides in a chapter in quickselect format

import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { QuickSelect } from '../../Elements/QuickSelect';
import{useAuthTools} from '../../Hooks/Auth';

export function ChapterQuickSelect (props) 
{
    const {Columns, CourseID, ...childProps} = props;

    const [chapterList, setChapterList] = useState(null);
    const {token, APICalls} = useAuthTools();

    const array = Array.from({length: Columns}, (_, index) => index);

    useEffect( () => {
        APICalls.GetChapters(CourseID)
        .then(
            data => {
                setChapterList(data); 
            })    
     },[token, CourseID]); 

     function chapterSort(a,b) {
         //No ordering of chapters yet, just creation order.
         return a.ID - b.ID
     }
     function LinkAddressGenerator(chapter) {
        var link =  '/courses/' + chapter.CourseID + '/chapters/' + chapter.ID;
        return link       
     }
     function RowTitleSelector(chapter) {
         return chapter.ChapterName;
     }
    
     return <QuickSelect
        Columns = {Columns}
        Rows = {chapterList}
        Sort = {chapterSort}
        LinkAddressGenerator = {LinkAddressGenerator}
        RowTitleSelector = {RowTitleSelector}
     />;
}