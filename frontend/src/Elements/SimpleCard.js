import * as React from "react";
import {Component} from "react";
import PropTypes from 'prop-types';
import { Card, Elevation } from "@blueprintjs/core";


class SimpleCard  extends Component
{
    render() {
        const {className} = this.props;
    return (
    <div className = "SimpleCardDiv">
        <Card className = {className} interactive={this.props.interactive} elevation={this.props.elevation} > 
        {this.props.children}
        </Card>
    </div>
    )
    }
}
    SimpleCard.propTypes = {
      elevation: PropTypes.number,
      interactive: PropTypes.bool
    };
    
    SimpleCard.defaultProps = {
        elevation: Elevation.TWO,
        interactive: true
    };

    export {SimpleCard}