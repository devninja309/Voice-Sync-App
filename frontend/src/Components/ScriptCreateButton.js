
import * as React from "react";

import { ScriptCreateDialog } from "./ScriptCreateDialog";
import { SimpleButton } from "../Elements/SimpleButton";

export function ScriptCreateButton (props) {

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <SimpleButton icon="cube-add" onClick={handleButtonClick}/>
            <ScriptCreateDialog isOpen = {isOpen} handleClose = {handleClose}/>
        </>
    )

}