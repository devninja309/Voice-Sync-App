
import * as React from "react";
import { useNavigate, useLocation} from "react-router-dom";

import { SimpleButton } from "./SimpleButton";
import { SimpleDialog } from "./SimpleDialog";

import { ButtonGroup } from "@blueprintjs/core";
import { SimpleTextInput } from "./SimpleTextEntry";

import{useAuthTools} from '../Hooks/Auth';


export function DeleteDialog (props) 
{
    const navigate = useNavigate();
    const currentLocation = useLocation();
    const callback = props.Callback;

    function Redirect() {
        if (currentLocation.pathname = props.FinishedDestination)
        {
            window.location.reload(); //force reload page, I'm open to better options
        }
        else{
        navigate(props.FinishedDestination, { replace: true }) //force reload of page
        }

    }

    function Delete(){
        props.DeleteFunction(props.ItemID).then(
            async (data) => {
                console.log(data);
                if (data == 'success')
                {
                    if (callback != null) {
                        callback().then(Redirect);
                    }
                    else {
                        Redirect();
                    }

 
                }
                else
                {
                    await alert ('There was a problem deleting this ' + props.ItemType + `\n` + data)
                    props.handleClose();
                }
            }
        );
    }
    const {children, handleClose, ...childProps} = props;
    return  (  
        <SimpleDialog {...childProps}>
            <h3>Are you sure you wish to delete this {props.ItemType} and all its children?</h3>
            <p/>
            <ButtonGroup>
                <SimpleButton onClick={Delete} Text={"Delete " + props.ItemType}/>
                <SimpleButton onClick={handleClose} Text="Cancel"/> 
            </ButtonGroup>
        </SimpleDialog>
    )
}