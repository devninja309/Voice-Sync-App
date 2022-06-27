import * as React from "react";
import {Component} from "react";
import { Popover2} from "@blueprintjs/popover2";
import { SimplePopoverCancelButton } from "./SimplePopoverCancelButton";


class SimplePopover  extends Component {

    render() {
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