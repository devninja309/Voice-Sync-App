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
import { getUrlPath } from '../Hooks/APICalls';
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

const SlideDetailsPage = (props) => {

    const CourseID =useParams().CourseID;
    const slideID =useParams().slideID;

    const [slide, setSlide] = useState('');
    const [slideAudioURL, setSlideAudioURL] = useState(null);
    const [slideHasAudio, setSlideHasAudio] = useState(false);
    const [slideAudioUpdating, setSlideAudioUpdating] = useState(false);
    const [selectedClip, setSelectedClip] = useState(null);
    const [selectedClipEdited, setSelectedClipEdited] = useState(false);
    const [selectedClipPostEdited, setSelectedClipPostEdited] = useState(false);
    const {token, APICalls} = useAuthTools();

    const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
    const handlePronunciationClose = useCallback(() => setIsPronunciationOpen(false), []);
    
    useEffect( () => {
        APICalls.GetSlideDetails(slideID)
        .then(
            data => {
                setSlide(data); //TODO Query organization doesn't support single responses.  Do we care?
                setSelectedClip(null);
                setSlideHasAudio(data.HasAudio)
                if (data.HasAudio) {
                    getSlideAudio(data.ID);
                }
            })
    
     },[token, CourseID, slideID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    
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
        console.log('Clip Text');
        console.log(updatedClip.ClipText)
        setSelectedClipEdited(true);
        setSelectedClip(updatedClip)
     }

     const selectedClipApproved = () => {
         const updatedClip = {...selectedClip, Approved: true}
         setSelectedClipPostEdited(true);
         setSelectedClip(updatedClip);
     }
     const pushChangedClip = (clip) => {
        if (selectedClipEdited) {
            clip.AudioClip = null;
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

    function DisplayClipsList() {
        if (slide.Clips){
            return slide.Clips.sort(sortByOrdinalValue).map((clip,index) => ( 
                <ClipListCard className="ClipsCard" key={clip.ID} clip = {clip} setSelectedClip={changeSelectedClip} updateClip={UpdateClip}/>
            ))
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
                            onChange={event => selectedClipTextModified(event)}
                            />
                        {(selectedClipEdited || selectedClipPostEdited) && <SimpleButton onClick= {()=> pushChangedClip(selectedClip)} Text="Save Changes" />}
                        <SimpleButton onClick={() => changeSelectedClip(null)} Text="Deselect Clip"/>
                        <VoiceSelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClip(newClip)}/>
                        <VolumeSelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClipPost(newClip)}/>
                        <PaceSelect clip = {selectedClip} onChange={(newClip) => UpdateSelectedClipPost(newClip)}/>
                        <SimpleButton onClick={() => selectedClipApproved()} Text="Approve Clip"/>
                        <SimpleTextArea className="simpleTextArea-largebox"
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

    return  (     
        <PageWrapper>
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
            <hr width='80%'/>
            </div>
            <div class = "div-Slide-Details-Container">
            <PronunciationEditDialog isOpen = {isPronunciationOpen} handleClose = {handlePronunciationClose}/>
                <div className = "div-Slide-Details-Container-Slide">
                    <div className ="div-Slide-Details-Container-TextArea">
                        {TextEditArea()}
                    </div>
                    <ButtonGroup>
                    <button className="input" onClick={mergeSlide}>Merge all clips</button>
                    <SimpleAudioPlayer audiofile = {slideAudioURL} updating={slideAudioUpdating}/>  
                    {slideHasAudio && <a href={slideAudioURL} download={'Slide-' + slide.ID + '-Audio.mp3'}>
                        <IconButton icon="cloud-download" text="Download Slide Audio" download/>
                    </a>}
                    </ButtonGroup>
                </div>
                <div class = "div-Slide-Details-ClipsList-Column">
                    <ButtonGroup className = "buttonGroup-row">
                
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
                <p> </p>
                <Tooltip
                            content={<span>Add new Pronunciation</span>}
                            openOnTargetFocus={false}
                            usePortal={false}
                        >
                        <IconButton icon="translate" onClick={() => setIsPronunciationOpen(true)}/>
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