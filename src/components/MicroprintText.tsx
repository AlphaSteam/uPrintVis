import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';

export default function MicroprintText(props) {
    const { textLines } = props


    return (
        <div style={{ "overflow": "visible", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: string, index: number) => {


                const fillColor = textLine.attributes.getNamedItem("fill").value
                const backgroundColor = textLine.attributes.getNamedItem("fill").value
                return (<span
                    key={index}>{textLine.textContent} <br /></span>)
            })}
        </div>

    )
}