//List of courses in DB
import React from 'react';

import {useState, useEffect} from 'react';


import{useAuthTools} from '../Hooks/Auth';

 export function DBTest (props) {


 const [courses, setCourses] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
     APICalls.DBTestCall().then(
         data => {
             console.log(data)
         })});
    return (
        <p> Hello World!</p>
    );
        
}
