//List of courses in DB
import { ButtonGroup } from '@blueprintjs/core';
import React from 'react';

import {useState, useEffect} from 'react';
import { IconButton } from '../Elements/IconButton';
import { SimpleButton } from '../Elements/SimpleButton';

import{useAuthTools} from '../Hooks/Auth';
import { PronunciationEditDialog } from './PronunciationEditDialog';

 export default function LogList (props) {


    const [pronunciations, setPronunciations] = useState('');
    const [selectedID, setSelectedID] = useState('');
    const [selectedWord, setSelectedWord] = useState('');
    const [selectedPronunciation, setSelectedPronunciation] = useState('');

    const {token, APICalls} = useAuthTools();

    const [isOpen, setIsOpen] = React.useState(false);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

 
 useEffect( () => {
    APICalls.GetPronunciations()
    .then(
        data => {
            setPronunciations(data)
        })

 },[ token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
 
 function EditPronunciation(pronunciationID, word, pronunciation){
     
    setSelectedID(pronunciationID);
    setSelectedPronunciation(pronunciation);
    setSelectedWord(word);

    setIsOpen(true);
 }
 function DeletePronunciation(pronunciationID){
     //console.log('Deleting');
     //let pronunciations = pronunciations.filter(pron => pron.ID == pronunciationID)

     APICalls.DeletePronunciation(pronunciationID)
        .then(
            setPronunciations(pronunciations.filter(pron => pron.ID != pronunciationID))        
        )
 }
 
 function DisplayPronunciationList() {
    if (pronunciations)
    {
        return pronunciations.map(pron => (<tr className = "LogListTable-DataRow"><td>{pron.Word}</td><td>{pron.Pronunciation}</td><td>
            <IconButton icon="edit" onClick = {()=> EditPronunciation(pron.ID, pron.Word, pron.Pronunciation)}/></td><td>
            <IconButton icon="trash" onClick = {()=> DeletePronunciation(pron.ID)}/></td></tr>))
    }
    else {
    }
}
const messageStyle = {
    width: '75%'
  };

    return (
        <div className = "logListBox"> 
            <PronunciationEditDialog isOpen = {isOpen} handleClose = {handleClose} ID={selectedID} 
                Word = {selectedWord} Pronunciation = {selectedPronunciation}/>
            <table className = "LogListTable">
                <thead>
                    <tr className = "LogListTable-HeaderRow">
                        <th>Word2</th>
                        <th>Pronunciation</th>
                        <th> </th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>        
                    {DisplayPronunciationList()}
                </tbody>
            </table>
            <IconButton icon="add"  onClick = {()=> EditPronunciation()}/>
        </div>
    )
 }
