
import * as React from "react";

import { ProjectCreateDialog } from "./ProjectCreateDialog";
import { SimpleButton } from "../Elements/SimpleButton";

export function ProjectCreateButton (props) {

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <SimpleButton icon="cube-add" onClick={handleButtonClick}/>
            <ProjectCreateDialog isOpen = {isOpen} handleClose = {handleClose}/>
        </>
    )

}