
import * as React from "react";

import { DeleteDialog } from "./DeleteDialog";
import { IconButton } from "./IconButton";

export function DeleteButton (props) {
    const itemID = props.ItemID;
    const itemType = props.ItemType
    const deleteEndpoint = props.DeleteFunction
    const finishedDestination = props.FinishedDestination;
    const callback = props.Callback;

    const [isOpen, setIsOpen] = React.useState(false);
    const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const handleClose = React.useCallback(() => setIsOpen(false), []);

    return (
        <>
            <IconButton icon="trash" onClick={handleButtonClick}/>
            <DeleteDialog isOpen = {isOpen} handleClose = {handleClose} ItemID = {itemID}
                ItemType = {itemType} DeleteFunction = {deleteEndpoint}
                FinishedDestination = {finishedDestination} Callback = {callback}/>
        </>
    )

}