
import * as React from "react";

import { CourseCreateDialog } from "./CourseCreateDialog";
import { IconButton } from "../../Elements/IconButton";

export function CourseCreateButton (props) {

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="cube-add" onClick={handleButtonClick}/>
            <CourseCreateDialog isOpen = {isOpen} handleClose = {handleClose}/>
        </>
    )

}