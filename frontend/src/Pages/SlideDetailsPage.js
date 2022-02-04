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

const SlideDetailsPage = (props) => {

    const CourseID =useParams().CourseID;
    const slideID =useParams().slideID;

    const [slide, setSlide] = useState('');
    const [selectedClip, setSelectedClip] = useState(null);
    const [selectedClipEdited, setSelectedClipEdited] = useState(false);
    const [selectedClipPostEdited, setSelectedClipPostEdited] = useState(false);
    const {token, APICalls} = useAuthTools();
    const [audioclipfile, setaudioclipfile] = useState(null);

    const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
    const handlePronunciationClose = useCallback(() => setIsPronunciationOpen(false), []);
    
    useEffect( () => {
        APICalls.GetSlideDetails(slideID)
        .then(
            data => {
                setSlide(data); //TODO Query organization doesn't support single responses.  Do we care?
            })
    
     },[token, CourseID, slideID]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    
     const changeSelectedClip = (clip) =>
     {
         setSelectedClipEdited(false);
         setSelectedClip(clip);
     }
     const selectedClipTextModified = (event) => {

        const updatedClip = {...selectedClip, ClipText: event.target.value}
        setSelectedClipEdited(true);

        setSelectedClip(updatedClip)

     }

     const selectedClipApproved = () => {
         const updatedClip = {...selectedClip, Approved: true}
         setSelectedClipPostEdited(true);
         setSelectedClip(updatedClip);
     }
     const pushChangedClip = (clip) => {
        clip.AudioClip = null;
        if (selectedClipEdited) {
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

     const getSlideClip = useCallback(async () => {
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
    function getVoiceList() {
        return [{value: 3, label: 'Voice 3'}];
    }
    function getVolumeList() {
        return [
            {value: 1, label: 'Quietest'},
            {value: 3, label: 'Normal'},
            {value: 5, label: 'Loudest'},
    ];
    }
    function getSpeedList() {
        return [
            {value: 1, label: 'Slowest'},
            {value: 3, label: 'Normal'},
            {value: 5, label: 'Fastest'},
    ];
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
                        <SimpleSelect className = "simpleSelect-small" options={getVoiceList()}/>
                        <SimpleSelect className = "simpleSelect-small" options={getVolumeList()}/>
                        <SimpleSelect className = "simpleSelect-small" options={getSpeedList()}/>
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
                <div class = "div-Slide-Details-Container-Slide">
                    <div class ="div-Slide-Details-Container-TextArea">
                        {TextEditArea()}
                    </div>
                    <SimpleAudioPlayer audiofile = {slide.MergedClip} />
                    <button className="input" onClick={getSlideClip}>Merge all clips</button>
                    <button className="input" onClick={() =>console.log(slide)}>Debug</button>
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