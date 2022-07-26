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
import { SimpleButton } from '../Elements/SimpleButton';
import { IconButton } from '../Elements/IconButton';
import { ButtonGroup } from '@blueprintjs/core';
import {Tooltip} from "@blueprintjs/core";
import {UpdateSlideText} from '../Etc/TextManagement';
import { PronunciationEditDialog } from '../Components/PronunciationEditDialog';
import { SlideQuickSelect } from '../Components/SlideQuickSelect';
import {VoiceSelect} from '../Components/VoiceSelect';
import { VolumeSelect } from '../Components/VolumeSelect';
import { PaceSelect } from '../Components/PaceSelect';
import { DelaySelect } from '../Components/DelaySelect';
import {Breadcrumbs} from '@blueprintjs/core';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {LoadingSpinner} from "../Elements/LoadingSpinner";
import {CardManagerProvider} from '../Hooks/CardManager';


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
    const [clipOrderUpdating, setClipOrderUpdating] = useState(false);
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
         if (selectedClipEdited || selectedClipPostEdited)
         {
             if (!window.confirm("You have unsaved changes. \n  Are you sure?"))
             {
                 return;
             }
         }
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

     const pushChangedClip = (oclip) => {
        var clip = {...oclip}
        if (selectedClipEdited) {
            clip.AudioClip = null;
            clip.HasAudio = false;
            if (clip.ClipStatusID === 2) {
                clip.ClipStatusID = 1;
            }
            clip.ClipAudioState = 1;
            APICalls.UpdateClip(clip)
        }
        else {
            APICalls.UpdatePostClip(clip);
        }
         setSelectedClipEdited(false);
         setSelectedClipPostEdited(false);
         var newSlide = {...slide};
         newSlide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID === clip.ID)] = clip;
         const updatedSlide = UpdateSlideText(newSlide);
         setSlide(updatedSlide);
         APICalls.UpdateSlide(updatedSlide);
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

    function sortByOrdinalValue(a,b) {
        return a.OrdinalValue - b.OrdinalValue;
    }
    async function UpdateAllClipAudio() {
        //Lock down the screen
        setSlideProcessing(true);

        const processClips = slide.Clips.filter(clip => clip.ClipAudioState === 1)
    
        for (const clip of processClips)
        {
            const promise = new Promise((resolve, reject) => {
                APICalls.UpdateClipAudio(clip.ID).then(returnClip => 
                    {
                        UpdateClip(returnClip);
                        resolve();
                    })        
                });
            await promise;
        }

        setSlideProcessing(false);
    }

    function DisplayClipsList(passedSlide) {
        if (slideProcessing || clipOrderUpdating) {
            return <LoadingSpinner/>
        }
        else if (passedSlide.Clips){
            return passedSlide.Clips.sort(sortByOrdinalValue).map((clip,index) => ( 
                <CardManagerProvider><ClipListCard className="ClipsCard" key={clip.ID} clip = {clip} ordinal = {clip.OrdinalValue} 
                    saveSelectedClip = {selectedClipEdited? ()=>pushChangedClip(selectedClip) : () =>{/*do nothing*/}}
                    selectedClipChanged = {selectedClipEdited} selectedClip = {clip.ID === selectedClip?.ID}
                    setSelectedClip={changeSelectedClip} updateClip={UpdateClip} moveClipCard = {MoveClipCard}
                    enabled={selectedClipEdited ||selectedClipPostEdited}/></CardManagerProvider>
            ))
        }      
    }
    function allClipsApproved() {
        if (!Array.isArray(slide.Clips)){ 
            return false;
        }
        const approved = slide.Clips.every((clip) => clip.ClipStatusID === 2);
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
                        {(selectedClipEdited || selectedClipPostEdited) && <SimpleButton onClick= {()=> pushChangedClip(selectedClip)} Text="Save Changes" className="simpleButtonSlideButtonGroup" disabled = {slideProcessing}  rightIcon="cloud-upload" />}
                        <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => changeSelectedClip(null)} Text="Deselect Clip" disabled = {slideProcessing} rightIcon="undo" />
                        <VoiceSelect className ="simpleButtonSlideButtonGroup" clip = {selectedClip} onChange={(newClip) => UpdateSelectedClip(newClip)}/>
                        {selectedClip.ClipStatusID !== 2 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(2)} Text="Approve Clip and Save" disabled = {slideProcessing} rightIcon ="thumbs-up"/>}
                        {selectedClip.ClipStatusID === 2 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(1)} Text="Disapprove Clip and Save" disabled = {slideProcessing} rightIcon ="thumbs-down"/>}
                        {selectedClip.ClipStatusID !== 3 && <SimpleButton className="simpleButtonSlideButtonGroup" onClick={() => selectedClipStatus(3)} Text="Request Review and Save" disabled = {slideProcessing} rightIcon ="warning-sign"/>}
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
    function UpdateClip(clip, deselect)
    {
        //This function should just update the in memory clip with a known change from the backend
        //preferably without reloading everything else.
        slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID === clip.ID)] = clip;

        //This should cause the cliplistcards to refresh.  That's the goal, at any rate.
        setSlide({...slide});
        if (deselect)
        {
            changeSelectedClip(null);
        }
    }
    function MoveClipCard(fromOrdinal, toOrdinal)
    {
        setClipOrderUpdating(true);
        const clipsToUpdate = [];
        const movingClip = slide.Clips.find(clip => clip.OrdinalValue === fromOrdinal);
        slide.Clips.filter(clip=> (clip.OrdinalValue > fromOrdinal && clip.OrdinalValue <=toOrdinal)).forEach(clip => {
            clip.OrdinalValue -=1;  
            slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID === clip.ID)] = {...clip}; 
            clipsToUpdate.push(clip);
        });
        slide.Clips.filter(clip=> (clip.OrdinalValue < fromOrdinal && clip.OrdinalValue >=toOrdinal)).forEach(clip => {
            clip.OrdinalValue +=1;      
            slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID === clip.ID)] = {...clip}; 
            clipsToUpdate.push(clip);
        });
        movingClip.OrdinalValue = toOrdinal;
        //Save Clip here  
        clipsToUpdate.push(movingClip);
        //APICalls.UpdatePostClip(movingClip);
        
        if (selectedClip) {
            selectedClip.OrdinalValue = slide.Clips[slide.Clips.findIndex(slideClip => slideClip.ID === selectedClip.ID)].OrdinalValue;
        }
        //TODO This will reload all clip audios
        APICalls.UpdateClipOrder(clipsToUpdate).then( () => {
            setClipOrderUpdating(false);
            setSlide({...slide})      
        })
        
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
        <div class="App">
            <header class="App-header">
                <div class="div-SlideHeader">
                    <div style={{width: '40%'}}>
                    <div><MidLogo/></div>
                    </div>
                    <div style={{width: '40%'}}>
                        <SlideQuickSelect Columns={3} ChapterID={slide.ChapterID}/>
                    </div>
            </div>
            <div class ="course-Name-Box">
            <h3>
            {slide.SlideName}
            </h3>
            <Breadcrumbs
                items={BreadCrumbsList}/>

            <hr width='80%'/>
            </div>
            <div class = "div-Slide-Details-Container">
            <PronunciationEditDialog isOpen = {isPronunciationOpen} handleClose = {handlePronunciationClose}/>
                <div class = "div-Slide-Details-Container-Slide">
                    <div class ="div-Slide-Details-Container-TextArea">
                        {TextEditArea()}
                    </div>
                    <ButtonGroup>
                    {allClipsApproved() && <SimpleButton class="input" onClick={mergeSlide} text={"Merge all clips"}/>}
                    <SimpleAudioPlayer audiofile = {slideAudioURL} updating={slideAudioUpdating} objectURL = {slide.ID} typeString = {"Slide"} isWideStyle = {true}/>  
                    </ButtonGroup>
                </div>
                <div class = "div-Slide-Details-ClipsList-Column">
                    <div>
                        <p></p>
                    <div class = "buttonGroup-row">
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
                                {allClipsApproved() && <SimpleButton className="input" onClick={mergeSlide}Text="Merge all clips"/>}
                                <SimpleAudioPlayer audiofile = {slideAudioURL} updating={slideAudioUpdating} objectURL = {slide.ID} typeString = {"Slide"} isWideStyle = {true}/>  
                        </ButtonGroup>
                    </div>
                    </div>
                
                <div class = "div-Slide-Details-ClipsList">
                    {DisplayClipsList(slide)} 
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