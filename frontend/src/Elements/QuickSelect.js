//This is meant to be a control that displays all the slides in a chapter in quickselect format

import { Link } from 'react-router-dom';

export function QuickSelect (props) 
{
    const {Columns, Rows, Sort, LinkAddressGenerator, RowTitleSelector, ...childProps} = props;

    const array = Array.from({length: Columns}, (_, index) => index);

     if (!Rows)
     {
         return (<div>no rows</div>)
     }

    function drawColumn(index, ColumnCount) {
        let data = [...Rows];
        data = [...data.sort(Sort)];
        return (
        <div className="div-QuickSelectColumn">
            {data.map((row, ordinalNum) => {
                const LinkAddress = LinkAddressGenerator(row);
                const item = ((ordinalNum)%ColumnCount == index) ? (<Link to={LinkAddress}><p>{RowTitleSelector(row)}</p></Link>) : '';
                return item;
            })}
        </div>
        )
    }
    return (
    <div className ="div-QuickSelectContainer">
        {array.map((ColumnIndex) => {
            return (
                drawColumn(ColumnIndex, Columns)
            )
        })}
    </div>
    )
}