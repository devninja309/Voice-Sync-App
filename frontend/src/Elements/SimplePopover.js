//Simple button, base class for other buttons

import * as React from "react";
import {Component} from "react";
import { Popover2} from "@blueprintjs/popover2";
import { SimplePopoverCancelButton } from "./SimplePopoverCancelButton";


class SimplePopover  extends Component {

    render() {
        //var content = (this.props.content !== 'undefined')?this.props.content :  <SimplePopoverCancelButton/>
    return (
    <Popover2
        interactionKind="click"
        placement="top"
        content={
            <SimplePopoverCancelButton/>
        }
    >
        {this.props.children}
    </Popover2>
    )
    }
}
    export {SimplePopover}