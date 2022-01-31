
import * as React from "react";
import {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import{useAuthTools} from '../Hooks/Auth';
import { ButtonGroup } from "@blueprintjs/core";

import { SimpleButton } from "../Elements/SimpleButton";
import { SimpleDialog } from "../Elements/SimpleDialog";

import { SimpleTextInput } from "../Elements/SimpleTextEntry";

import { SimpleAudioPlayer } from "../Elements/SimpleAudioPlayer";


export function PronunciationEditDialog (props) 
{
    const pronunciationID = props.ID;

    const { APICalls} = useAuthTools();
    
    const [word, setWord] = React.useState('');
    const [pronunciation, setPronunciation] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [updating, setUpdating] = React.useState(false);
 
    useEffect( () => {
         setWord(props.Word);
         setPronunciation(props.Pronunciation);
    },[props]); 

    function CheckPronunciation() {
        setUrl(null);
        setUpdating(true);
        if (pronunciation != null)
        {
            APICalls.GetPronunciationAudio(pronunciation)
                .then(
                    data => {
                        data.blob().then ( responseBlob => {
                            const objectURL = URL.createObjectURL(responseBlob);
                            setUrl(objectURL);
                            setUpdating(false);
                        })

                })
        }
    }

    function UpdatePronunciation(){
        if (pronunciationID) { 
            APICalls.UpdatePronunciation({
                "ID":pronunciationID,
                "Word": word,
                "Pronunciation": pronunciation,
            }).then(
                handleClose()
            );
        }
        else { 
            APICalls.CreatePronunciation({
                "Word": word,
                "Pronunciation": pronunciation,
            }).then(
                handleClose()
            );
        }
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Create a new course</h3>
            <SimpleTextInput placeholder="Enter Word" defaultValue = {props.Word} onChange={event => setWord(event.target.value)}/>
            <SimpleTextInput placeholder="Enter Pronunciation" defaultValue = {props.Pronunciation} onChange={event => setPronunciation(event.target.value)}/>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={CheckPronunciation} Text="Check Pronunciation"/>
                <SimpleButton onClick={UpdatePronunciation} Text="Save Pronunciation"/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
                <SimpleAudioPlayer audiofile = {url} updating={updating}/>  
            </ButtonGroup>
        </SimpleDialog>
    )
}