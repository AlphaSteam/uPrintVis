import React, { useState } from "react";
import { TinyColor } from '@ctrl/tinycolor';

export default function Button(
    props: {
        children: any;
        backgroundColor?: string;
        onClick?: any;
        size?: string;
    }) {
    const [buttonHovered, setButtonHovered] = useState(false);

    const { children, backgroundColor = "black", onClick = () => null, size = "3rem"
    } = props

    return (
        <div
            style={{
                borderRadius: "99999px",
                backgroundColor: buttonHovered ?
                    new TinyColor(backgroundColor).darken(15).toRgbString() :
                    backgroundColor,
                display: "flex",
                cursor: "pointer",
                border: "black 1px solid",
                boxShadow: "2px 2px rgba(0,0,0,0.3)",
                padding: "0.5rem",
                justifyContent: "center"
            }}
            onClick={onClick}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
        >
            <div style={{
                display: "flex",
                alignItems: "center"
            }}>
                {children}
            </div>
        </div>
    )
}