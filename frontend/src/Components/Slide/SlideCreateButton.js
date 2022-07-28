
import * as React from "react";

import { SlideCreateDialog } from "../SlideCreateDialog";
import { IconButton } from "../../Elements/IconButton";

export function SlideCreateButton (props) {
    var ChapterID = props.ChapterID;
    var CourseID = props.CourseID;
    var nextSlideOrdinal = props.nextSlideOrdinal;

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="cube-add" onClick={handleButtonClick}/>
            <SlideCreateDialog CourseID = {CourseID} ChapterID={ChapterID} isOpen = {isOpen} handleClose = {handleClose} nextSlideOrdinal= {nextSlideOrdinal}/>
        </>
    )

}