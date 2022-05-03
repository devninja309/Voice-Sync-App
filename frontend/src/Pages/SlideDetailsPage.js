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
import { SimpleAudioPlayer } from '../Elements/SimpleAudioPlayer';
import { SimpleTextArea } from '../Elements/SimpleTextArea';
import { useAuthTools } from '../Hooks/Auth';
import { MidLogo } from '../Elements/Logos';
import { getUrlPath, UpdateClipAudio } from '../Hooks/APICalls';
import { SimpleButton } from '../Elements/SimpleButton';
import { IconButton } from '../Elements/IconButton';
import { ButtonGroup, Icon } from '@blueprintjs/core';
import {Tooltip} from "@blueprintjs/core";
import {UpdateSlideText} from '../Etc/TextManagement';
import { PronunciationEditDialog } from '../Components/PronunciationEditDialog';
import { SimpleSelect } from '../Elements/SimpleSelect';
import { SlideQuickSelect } from '../Components/SlideQuickSelect';
import {VoiceSelect} from '../Components/VoiceSelect';
import { VolumeSelect } from '../Components/VolumeSelect';
import { PaceSelect } from '../Components/PaceSelect';
import { DelaySelect } from '../Components/DelaySelect';
import {Breadcrumbs} from '@blueprintjs/core';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {LoadingSpinner} from "../Elements/LoadingSpinner";


const SlideDetailsPage = (props) => {

    const CourseID =useParams().CourseID;
    const slideID =useParams().slideID;
    const ChapterID = useParams().ChapterID;

    const [slide, setSlide] = useState('');
    const [courseName, setCourseName] = useState('Loading');
    const [chapterName, setChapterName] = useState('Loading');
    const [slideAudioURL, setSlideAudioURL] = useState(null);
    const [slideHasAudio, setSlideHasAudio] = useState(false);
    const [slideAudioUpdating, setSlideAudioUpdating] = useState(false);
    const [selectedClip, setSelectedClip] = useState(null);
    const [selectedClipEdited, setSelectedClipEdited] = useState(false);
    const [selectedClipPostEdited, setSelectedClipPostEdited] = useState(false);
    const [slideProcessing, setSlideProcessing] = useState(false);
    const {token, APICalls} = useAuthTools();

    const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
    const handlePronunciationClose = useCallback(() => setIsPronunciationOpen(false), []);
    
    useEffect( () => {
        setSlideHasAudio(false);
        setSlideAudioURL(null)
        LoadSlide();
        APICalls.GetChapterDetails(ChapterID)
        .then(
            data => {
                setChapterName(data.ChapterName);
            }
        )
        APICalls.GetCourseDetails(CourseID)
        .then(
            data => {
                setCourseName(data.CourseName);
            }
        )
    
     },[token, ChapterID, CourseID, slideID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    
     const LoadSlide = () => {

        APICalls.GetSlideDetails(slideID)
            .then(
                data => {
                    setSlide(data);
                    setSelectedClip(null);
                    setSlideHasAudio(data.HasAudio)
                    if (data.HasAudio) {
                        getSlideAudio(data.ID);
                    }
                    setSlideProcessing(false);
                })
     }

     const changeSelectedClip = (clip) =>
     {
         setSelectedClipEdited(false);
         setSelectedClipPostEdited(false);
         setSelectedClip(clip);
     }
     //Update values on the selected clip.
     //The first one is a generic edit, while the others are specific use cases
     const UpdateSelectedClip = (newClip) => {
         setSelectedClipEdited(true);
         setSelectedClip(newClip);
     }     
     const UpdateSelectedClipPost = (newClip) => {
        setSelectedClipPostEdited(true);
        setSelectedClip(newClip);
    }
     const selectedClipTextModified = (event) => {
        const updatedClip = {...selectedClip, ClipText: event.target.value}
        setSelectedClipEdited(true);
        setSelectedClip(updatedClip)
     }
     const selectedClipStatus = (clipStatusID) => {
        const updatedClip = {...selectedClip, ClipStatusID: clipStatusID}
        setSelectedClipPostEdited(true);
        setSelectedClip(updatedClip);
        pushChangedClip(updatedClip);

     }
     const pushChangedClip = (clip) => {
        if (selectedClipEdited) {
            clip.AudioClip = null;
            clip.HasAudio = false;
            if (clip.ClipStatusID == 2) {
                clip.ClipStatusID = 1;
            }
            APICalls.UpdateClip(clip)
        }
        else {
            APICalls.UpdatePostClip(clip);
        }
         setSelectedClipEdited(false);
         setSelectedClipPostEdited(false);
         slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == clip.ID)] = clip;
         const newSlide = UpdateSlideText(slide);
         setSlide(newSlide);
         APICalls.UpdateSlide(newSlide);
     }

     const mergeSlide = () => {
       setSlideAudioUpdating(true);
       setSlideAudioURL(null);
       APICalls.GenerateSlideAudio(slide.ID).then(() => {
           setSlideHasAudio(true);
           getSlideAudio(slide.ID);
     })};

     function getSlideAudio(slideID) {
         setSlideAudioUpdating(true);
         
         APICalls.GetSlideAudio(slideID).then( (data) => {
            data.blob().then ( responseBlob => {
                const objectURL = URL.createObjectURL(responseBlob);
                setSlideAudioURL(objectURL);
                setSlideAudioUpdating(false);
            })
         })
     }
     function downloadSlideAudio () {
         APICalls.DownloadSlideAudio(slide.ID).then ((data) => {
             data.blob().then (responseBlob => {
                const objectURL = URL.createObjectURL(responseBlob);
                window.open(responseBlob);
            })})
     }

    function sortByOrdinalValue(a,b) {
        return a.OrdinalValue - b.OrdinalValue;
    }
    function UpdateAllClipAudio() {
        //Lock down the screen
        setSlideProcessing(true);

        //Submit a separate call for each clip that isn't submitted
        const promiseArray = [];
        const processClips = slide.Clips.filter(clip => !clip.HasAudio)
        //console.log('Process Clips: ' + processClips);
        processClips.forEach(clip => {
            //console.log('Updating an audio clip');
            //console.log(clip);
            const promise = new Promise((resolve, reject) => {
            APICalls.UpdateClipAudio(clip.ID).then(returnClip => resolve())
            
            })
        promiseArray.push( promise);
        });
        //Reload the entire slide
        Promise.all(promiseArray).then(()=>{
            LoadSlide();
        });
    }

    function DisplayClipsList(passedSlide) {
        if (slideProcessing) {
            return <LoadingSpinner/>
        }
        else if (passedSlide.Clips){
            return passedSlide.Clips.sort(sortByOrdinalValue).map((clip,index) => ( 
                <ClipListCard className="ClipsCard" key={clip.ID} clip = {clip} ordinal = {clip.OrdinalValue} setSelectedClip={changeSelectedClip} updateClip={UpdateClip} MoveClipCard = {MoveClipCard}/>
            ))
        }      
    }
    function allClipsApproved() {
        if (!Array.isArray(slide.Clips)){ 
            return false;
        }
        const approved = slide.Clips.every((clip) => clip.ClipStatusID == 2);
        return approved;
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
                        <SimpleTextArea className="simpleTextArea-smallbox"
                            value={selectedClip.ClipText}
                            onChange={event => selectedClipTextModified(event)}
                            disabled = {slideProcessing}
                            />
                        <div className="div-ClipEditButtonRow">
                        {(selectedClipEdited || selectedClipPostEdited) && <SimpleButton onClick= {()=> pushChangedClip(selectedClip)} Text="Save Changes" className="simpleButtonSlideButtonGroup" disabled = {slideProcessing} />}
                        <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => changeSelectedClip(null)} Text="Deselect Clip" disabled = {slideProcessing}/>
                        <VoiceSelect className ="simpleButtonSlideButtonGroup" clip = {selectedClip} onChange={(newClip) => UpdateSelectedClip(newClip)}/>
                        {selectedClip.ClipStatusID != 2 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(2)} Text="Approve Clip and Save" disabled = {slideProcessing} rightIcon ="thumbs-up"/>}
                        {selectedClip.ClipStatusID == 2 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(1)} Text="Disapprove Clip and Save" disabled = {slideProcessing} rightIcon ="thumbs-down"/>}
                        {selectedClip.ClipStatusID != 3 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(3)} Text="Request Review and Save" disabled = {slideProcessing} rightIcon ="warning-sign"/>}
                        </div>
                        <div className="div-ClipEditButtonRow">
                        <VolumeSelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClipPost(newClip)} disabled = {slideProcessing}/>
                        <PaceSelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClipPost(newClip)} disabled = {slideProcessing}/>
                        <DelaySelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClipPost(newClip)} disabled = {slideProcessing}/>
                        </div>
                        <SimpleTextArea className="simpleTextArea-midbox"
                        value={slide.SlideText} 
                        disabled= {true}
                        placeholder="Enter Slide Text" 
                        onChange={event => setSlide({...slide, SlideText: event.target.value})}
                        />

                    </div>
        }
    }
    function UpdateClip(clip)
    {
        slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == clip.ID)] = clip;

        //TODO This will reload all clip audios
        setSlide({...slide});
    }
    function MoveClipCard(fromOrdinal, toOrdinal)
    {
        //start spinner
        const clipsToUpdate = [];
        const movingClip = slide.Clips.find(clip => clip.OrdinalValue === fromOrdinal);
        slide.Clips.filter(clip=> (clip.OrdinalValue > fromOrdinal && clip.OrdinalValue <=toOrdinal)).forEach(clip => {
            clip.OrdinalValue -=1;  
            slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == clip.ID)] = {...clip}; 
            clipsToUpdate.push(clip);
            //APICalls.UpdatePostClip(clip);  
            //Save Clip here  
        });
        slide.Clips.filter(clip=> (clip.OrdinalValue < fromOrdinal && clip.OrdinalValue >=toOrdinal)).forEach(clip => {
            clip.OrdinalValue +=1;      
            slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == clip.ID)] = {...clip}; 
            clipsToUpdate.push(clip);
            //it APICalls.UpdatePostClip(clip);
            //Save Clip here  
        });
        movingClip.OrdinalValue = toOrdinal;
        //Save Clip here  
        clipsToUpdate.push(movingClip);
        //APICalls.UpdatePostClip(movingClip);
        
        if (selectedClip) {
            selectedClip.OrdinalValue = slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID == selectedClip.ID)].OrdinalValue;
        }
        //TODO This will reload all clip audios
        APICalls.UpdateClipOrder(clipsToUpdate).then( setSlide({...slide}))
        
    }
    //TODO This default clip definition is fragile
    function addClip() {
        const ordinalValue = Math.max(...slide.Clips.map(clip => clip.OrdinalValue)) + 1;
        const Clip = {
            SlideID: slideID,
            ClipText: "",
            OrdinalValue: ordinalValue,
            VoiceID: 3,
            Volume: 150,
            Speed: 105,
            Delay: 1, 
            ClipStatusID: 1     
        }
        APICalls.CreateClip(Clip).then(
            data => {
                slide.Clips.push(data);
                setSlide({...slide});
            }
        )
    }
    const BreadCrumbsList = [
        { href: `/courses/${CourseID}`, text: `${courseName}` },
        { href:  `/courses/${CourseID}/chapters/${slide.ChapterID}`, text: `${chapterName}` },
        { href: `/courses/${CourseID}/chapters/${slide.ChapterID}/slides/${slideID}`, text: `${slide.SlideName}` },
    ];

    return  (     
        <PageWrapper><DndProvider backend={HTML5Backend}>
        <div className="App">
            <header className="App-header">
                <div className="div-SlideHeader">
                    <div style={{width: '40%'}}>
                    <div><MidLogo/></div>
                    </div>
                    <div style={{width: '40%'}}>
                        <SlideQuickSelect Columns={3} ChapterID={slide.ChapterID}/>
                    </div>
            </div>
            <div className ="course-Name-Box">
            <h3>
            {slide.SlideName}
            </h3>
            <Breadcrumbs
                items={BreadCrumbsList}/>

            <hr width='80%'/>
            </div>
            <div class = "div-Slide-Details-Container">
            <PronunciationEditDialog isOpen = {isPronunciationOpen} handleClose = {handlePronunciationClose}/>
                <div className = "div-Slide-Details-Container-Slide">
                    <div className ="div-Slide-Details-Container-TextArea">
                        {TextEditArea()}
                    </div>
                    <ButtonGroup>
                    {allClipsApproved() && <button className="input" onClick={mergeSlide}>Merge all clips</button>}
                    <SimpleAudioPlayer audiofile = {slideAudioURL} updating={slideAudioUpdating}/>  
                    {slideHasAudio && <a href={slideAudioURL} download={'Slide-' + slide.ID + '-Audio.mp3'}>
                        <IconButton icon="cloud-download" text="Download Slide Audio" download/>
                    </a>}
                    </ButtonGroup>
                </div>
                <div className = "div-Slide-Details-ClipsList-Column">
                    <div>
                        <p></p>
                    <div className = "buttonGroup-row">
                        <ButtonGroup className = "buttonGroup-row buttonGroup-row-left">     
                            <Tooltip
                                content={<span>Add New Clip</span>}
                                openOnTargetFocus={false}
                                usePortal={false}
                            >
                            <IconButton icon="plus" onClick = {() => addClip()}/>
                            </Tooltip>
                            <p> </p>
                            <Tooltip
                                        content={<span>Submit all unsubmitted clips</span>}
                                        openOnTargetFocus={false}
                                        usePortal={false}
                                    >
                                    <IconButton icon="refresh" onClick = {() => UpdateAllClipAudio()}/>
                            </Tooltip>
                            <p> </p>
                            <Tooltip
                                        content={<span>Add new Pronunciation</span>}
                                        openOnTargetFocus={false}
                                        usePortal={false}
                                    >
                                    <IconButton icon="translate" onClick={() => setIsPronunciationOpen(true)}/>
                            </Tooltip>
                        </ButtonGroup>
                        <ButtonGroup className = "buttonGroup-row buttonGroup-row-right">     
                                {allClipsApproved() && <button className="input" onClick={mergeSlide}>Merge all clips</button>}
                                <SimpleAudioPlayer audiofile = {slideAudioURL} updating={slideAudioUpdating}/>  
                                {slideHasAudio && <a href={slideAudioURL} download={'Slide-' + slide.ID + '-Audio.mp3'}>
                                    <IconButton icon="cloud-download" text="Download Slide Audio" download/>
                                    </a>}
                        </ButtonGroup>
                    </div>
                    </div>
                <div class = "div-Slide-Details-ClipsList">
                    {DisplayClipsList(slide) }
                </div>
            </div>
                </div>
            </header>
        </div>
        </DndProvider>
        </PageWrapper>
    )
}
export default SlideDetailsPage;