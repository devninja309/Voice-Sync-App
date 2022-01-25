
import * as React from "react";

import { DeleteButton } from "../Elements/DeleteButton";
import { Link } from "react-router-dom";
import{useAuthTools} from '../Hooks/Auth';
import {UpdateSlideTextOnServer} from '../Etc/TextManagement';

export function ClipDeleteButton (props) {
    const {token, APICalls} = useAuthTools();
    const redirect = props.Redirect
    const callback = ()=>UpdateSlideTextOnServer(APICalls, props.SlideID)
    return (
            <DeleteButton        
                ItemType = 'clip' 
                DeleteFunction = {APICalls.DeleteClip}
                FinishedDestination = {redirect}
                Callback = {callback}
                {...props}
            />        
    )

}