//List of courses in DB
import React from 'react';

import {useState, useEffect} from 'react';

import{useAuthTools} from '../Hooks/Auth';

 export default function LogList (props) {


 const [logs, setLogs] = useState('');
 const {token, APICalls} = useAuthTools();
 
 useEffect( () => {
    APICalls.GetEventLogs()
    .then(
        data => {
            setLogs(data.sort(function(a,b){
                return new Date(b.TimeStamp) - new Date(a.TimeStamp);
              }));
        })

 },[token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 function DisplayLogsList() {
    if (logs)
    {
        return logs.map(log => (<tr className = "LogListTable-DataRow"><td>{new Date(log.TimeStamp).toLocaleString()}</td><td>{log.User}</td><td>{log.Message}</td></tr>))
    }
    else {
    }
}
const messageStyle = {
    width: '75%'
  };

    return (
        <div className = "logListBox"> 
            <table className = "LogListTable">
                <thead>
                    <tr className = "LogListTable-HeaderRow">
                        <th>Date</th>
                        <th>User</th>
                        <th style={messageStyle}>Message</th>
                    </tr>
                </thead>
                <tbody>        
                    {DisplayLogsList()}
                </tbody>
            </table>
        </div>
    )
 }
