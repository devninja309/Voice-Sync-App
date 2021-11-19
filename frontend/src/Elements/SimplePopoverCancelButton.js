

import * as React from "react";

import { SimpleButton } from "../Elements/SimpleButton";
import { Classes} from "@blueprintjs/popover2";

export const  SimplePopoverCancelButton = (props) =>
{
<div className={Classes.POPOVER2_DISMISS}>
    <SimpleButton>Cancel</SimpleButton>
</div>
}