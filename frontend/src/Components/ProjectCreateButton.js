
import * as React from "react";

import { ProjectCreateDialog } from "./ProjectCreateDialog";
import { SimpleButton } from "../Elements/SimpleButton";
import { IconButton } from "../Elements/IconButton";

export function ProjectCreateButton (props) {

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="cube-add" onClick={handleButtonClick}/>
            <ProjectCreateDialog isOpen = {isOpen} handleClose = {handleClose}/>
        </>
    )

}