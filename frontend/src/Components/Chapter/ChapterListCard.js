
import * as React from "react";
import { Link } from "react-router-dom";

import { SimpleCard } from "../Elements/SimpleCard";
import {ChapterDeleteButton } from "./ChapterDeleteButton";



export function ChapterListCard (props) 
{
    const {chapter, ...childProps} = props;
    const LinkAddress = 'chapters/' + chapter.ID
    return (
        <div className = "courseListCard" key={chapter.ID} >
            <SimpleCard  {...childProps}>
                <Link to={LinkAddress}>
                        <div>
                    {chapter.ChapterName}
                    </div> <div>
                    Slides: {chapter.SlideCount}
                    </div>
                </Link>
                <ChapterDeleteButton 
                    ItemID = {chapter.ID}
                    CourseID = {chapter.CourseID}
                    />
            </SimpleCard>
        </div>
    )
}