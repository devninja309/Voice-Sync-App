
import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";



export function ChapterListCard (props) 
{
    const {chapter, ...childProps} = props;
    const LinkAddress = 'chapters/' + chapter.ID
    return (
        <div className = "courseListCard" key={chapter.ID} >
        <Link to={LinkAddress}>
            <SimpleCard  {...childProps}>
                <div>
            {chapter.ChapterName}
            </div> <div>
            Slides: {chapter.SlideCount}
            </div>
            </SimpleCard>
        </Link>
        </div>
    )
}