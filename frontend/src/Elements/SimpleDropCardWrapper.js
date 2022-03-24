
import * as React from "react";
import { useDrop } from 'react-dnd'
import {ItemTypes} from "../Components/DnDItemTypes";
import { useState, useEffect,useRef } from 'react';

export function SimpleDropCardWrapper(props) {

    const children = {...props.children}
    const ordinal = props.ordinal;

    const [hoverStyle, setHoverStyle] = useState('');


    function onDrop(item, offset) {
        console.log('Dropped Item');
        const original = item.card.props.ordinal;
        const index = calculateInsertIndex(offset.x, original);
        props.MoveCard(original, index);
    }
    function onHover(item, monitor) {
        const offset = monitor.getClientOffset();
        const original = item.card.props.ordinal;
        const index = calculateInsertIndex(offset.x, original)

        const adj = original < ordinal ? 1 : 0
        const style = (index == ordinal - adj) ? {borderLeftStyle: 'solid'} : {borderRightStyle: 'solid'}

        setHoverStyle(style);

    }

    const calculateInsertIndex = (offset, original) => {
        const boundaries = document.getElementById(props.id).getBoundingClientRect();
        const midX = boundaries.width / 2;
        const adj = original < ordinal ? 1 : 0
        return (offset-boundaries.x) < midX ? ordinal - adj : ordinal -adj + 1
    }

    const [{ isOver }, drop] = useDrop(
        () => ({
          accept: ItemTypes.ClipCard,
          drop: (item, monitor) => onDrop(item, monitor.getClientOffset()),
          hover: (item, monitor) => onHover(item, monitor),
          collect: (monitor) => ({
            isOver: !!monitor.isOver()
          })
        }),
        [ordinal]
      )
    
      const style = isOver?  hoverStyle: {}

    return (
        <div style={style} {...props} ref={drop}>
            {children}
        </div>
    )
}