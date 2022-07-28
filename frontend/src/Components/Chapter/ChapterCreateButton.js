
import * as React from "react";

import { ChapterCreateDialog } from "./ChapterCreateDialog";
import { IconButton } from "../../Elements/IconButton";

export function ChapterCreateButton (props) {
    var CourseID = props.CourseID;

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="cube-add" onClick={handleButtonClick}/>
            <ChapterCreateDialog isOpen = {isOpen} handleClose = {handleClose} CourseID = {CourseID}/>
        </>
    )

}