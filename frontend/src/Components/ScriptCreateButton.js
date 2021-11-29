
import * as React from "react";

import { ScriptCreateDialog } from "./ScriptCreateDialog";
import { SimpleButton } from "../Elements/SimpleButton";
import { IconButton } from "../Elements/IconButton";

export function ScriptCreateButton (props) {
    var projectID = props.projectID;

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="cube-add" onClick={handleButtonClick}/>
            <ScriptCreateDialog projectID={projectID} isOpen = {isOpen} handleClose = {handleClose}/>
        </>
    )

}