//Simple button, base class for other buttons

import * as React from "react";
import {useState, useEffect} from 'react';
import { useParams } from 'react-router';

import { IconButton } from "../Elements/IconButton";
import{useAuthTools} from '../Hooks/Auth';


export function ChapterDownloadAllClipsButton (props) 
{
    const ChapterID = useParams().ChapterID;    
    const [slides, setSlides] = useState(null);
    const {token, APICalls} = useAuthTools();
    
    useEffect( () => {
        APICalls.GetSlides(ChapterID)
        .then(
            data => {
                setSlides(data); 
            })
    
     },[token, ChapterID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
     

    function downloadAll() {
        slides.forEach(slide => 
            //APICalls.DownloadSlideAudio(slide.ID));
            {
                if (slide.HasAudio) {
                    try {
                    APICalls.GetSlideAudio(slide.ID).then( (data) => {
                        data.blob().then ( responseBlob => {
                            const objectURL = URL.createObjectURL(responseBlob);
                            const fileName = 'Slide-' + slide.SlideName + '-Audio.mp3';

                            var link=document.createElement('a');
                            link.href = objectURL;
                            link.download = fileName;
                            link.click();
                        })
                    })}
                    finally {
                        //DGAF
                    }
                }
            }
        )
            

    }

    return  ( <div>
        {(slides != null) && <IconButton icon="cloud-download" text="Download all generated slide clips'"  onClick={() => downloadAll()} {...props} /> }
        </div>
        )
}
