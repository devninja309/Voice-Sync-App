//Page that loads when a narration is opened
//A narration should tie 1-1 with an original file.

//This should contain the original text file (uneditable) as well as a number of tabs(?) for broken up 
//Each tab should have a ClipEditControl
//This page should have a 'finish and generate master naration' button that gets all the clips , merges them, and exports them



//I'm still a copy of the course list screen
//List of active courses
import { useState, useEffect,useCallback } from 'react';
import { useParams } from 'react-router';
import { PageWrapper } from '../Components/PageWrapper';
import { ClipListCard } from '../Components/ClipListCard';
import { PlayAudioClip } from '../Components/PlayAudioClip';
import { SimpleTextArea } from '../Elements/SimpleTextArea';
import { useAuthTools } from '../Hooks/Auth';
import { BigLogo } from '../Elements/Logos';
import { getUrlPath } from '../Hooks/APICalls';
import { SimpleButton } from '../Elements/SimpleButton';
import { IconButton } from '../Elements/IconButton';
import { ButtonGroup, Icon } from '@blueprintjs/core';
import {Tooltip} from "@blueprintjs/core";

const SlideDetailsPage = (props) => {

    const CourseID =useParams().CourseID;
    const slideID =useParams().slideID;

    const [slide, setSlide] = useState('');
    const [selectedClip, setSelectedClip] = useState(null);
    const {token, APICalls} = useAuthTools();
    const [audioclipfile, setaudioclipfile] = useState(null);
    
    useEffect( () => {
        APICalls.GetSlideDetails(slideID)
        .then(
            data => {
                setSlide(data[0]); //TODO Query organization doesn't support single responses.  Do we care?

            })
    
     },[token, CourseID, slideID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    

     const getClip = useCallback(async () => {
        console.log ('Slide def');
        console.log(slide); 
       setSlide({...slide, SlideClip: null})
       const path = getUrlPath('stream');
       const slideText = slide.SlideText
       const currentAvatar = 3;
       const response = await fetch(path, { 
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({ avatarId: currentAvatar, text: slideText})
         });
       const responseBlob = await response.blob()
       const objectURL = URL.createObjectURL(responseBlob);
       setSlide({...slide, MergedClip: objectURL})
       setaudioclipfile(objectURL)
     }, [ slide])

     const dummyClipList = [{
         ID: 1,
         ClipText: "Dummy Text"
     },{
        ID: 2,
        ClipText: "Dummy Text"
    },{
        ID: 3,
        ClipText: "Dummy Text"
    },{
        ID: 4,
        ClipText: "Dummy Text"
    }];
    function sortByOrdinalValue(a,b) {
        return a.OrdinalValue - b.OrdinalValue;
    }
    function DisplayClipsList() {
        if (dummyClipList && false)
        {
            return dummyClipList.map(clip => (<ClipListCard key={clip.ID} clip = {clip} setSelectedClip={setSelectedClip}/>))
        }
        else {
            if (slide.Clips){
                console.log (slide);
                return slide.Clips.sort(sortByOrdinalValue).map(clip => (
                    //TODO insert a spinner here for when updating.  What's the pattern for that?  Set the clip to null?
                    <ClipListCard key={clip.ID} clip = {clip} setSelectedClip={setSelectedClip} updateClipAudio={UpdateClipAudio}/>
                ))
            }
        }
    }
    function TextEditArea() {
        if (selectedClip === null) {
        return <SimpleTextArea className="simpleTextArea-largebox"
                        value={slide.SlideText} 
                        disabled= {true}
                        placeholder="Enter Slide Text" 
                        onChange={event => setSlide({...slide, SlideText: event.target.value})}
                        />
        }
        else {
            return <div>
                        <SimpleTextArea className="simpleTextArea-largebox"
                            value={selectedClip.ClipText}
                            onChange={event => setSelectedClip({...selectedClip, ClipText: event.target.value})}
                            />
                        <SimpleButton onClick={() => setSelectedClip(null)} Text="Deselect Clip"/>
                        <SimpleTextArea className="simpleTextArea-largebox"
                        value={slide.SlideText} 
                        disabled= {true}
                        placeholder="Enter Slide Text" 
                        onChange={event => setSlide({...slide, SlideText: event.target.value})}
                        />

                    </div>
        }
    }
    function UpdateClipAudio(clipID)
    {
        APICalls.UpdateClipAudio(clipID).then(clip => slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == clipID)] = clip);
    }



    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <BigLogo/>
            <div className ="course-Name-Box">
            <h3>
            {slide.SlideName}
            </h3>
            <hr width='80%'/>
            <p  className ="p-course-Deslideion" >
                This is the slide details page.
                A slide is a single output audio file.
                It will have a page for the main slide (full text).
                It will have tabs for the 'clips', i.e. each sentence.
                Each clip will be able to generate it's own audio file.
                It will have a generate full audio clip for all sentences, merging them together 
                    and exporting a copy to the IA shared folder. 
            </p>
            </div>
            <div class = "div-Slide-Details-Container">
                <div class = "div-Slide-Details-Container-Slide">
                    <div class ="div-Slide-Details-Container-TextArea">
                        {TextEditArea()}
                    </div>
                    <PlayAudioClip audiofile = {slide.MergedClip} />
                    <button className="input" onClick={getClip}>Merge all clips</button>
                    <button className="input" onClick={() =>console.log(slide)}>Debug</button>
                </div>
                <div class = "div-Slide-Details-ClipsList-Column">
                    <ButtonGroup>
                
                <Tooltip
                            content={<span>Add New Clip</span>}
                            openOnTargetFocus={false}
                            usePortal={false}
                        >
                        <IconButton icon="plus"/>
                </Tooltip>
                <p> </p>
                <Tooltip
                            content={<span>Submit all unsubmitted clips</span>}
                            openOnTargetFocus={false}
                            usePortal={false}
                        >
                        <IconButton icon="refresh"/>
                </Tooltip>
                    </ButtonGroup>
                    <div class = "div-Slide-Details-ClipsList">
                    {DisplayClipsList() }
                    </div>
                </div>
            </div>
            </header>
        </div>
        </PageWrapper>
    )
}
export default SlideDetailsPage;