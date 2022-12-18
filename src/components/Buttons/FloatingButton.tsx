import React, { useState } from "react";
import { TinyColor } from '@ctrl/tinycolor';

export default function FloatingButton(
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
                borderRadius: "999999px",
                backgroundColor: buttonHovered ? new TinyColor(backgroundColor).darken(15).toRgbString() :
                    backgroundColor,
                width: size,
                height: size,
                display: "flex",
                cursor: "pointer",
                border: "black 1px solid",
                boxShadow: "2px 2px rgba(0,0,0,0.3)",
                alignSelf: "center"
            }}
            onClick={onClick}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
        >
            <div style={{ margin: "auto" }}>
                {children}
            </div>
        </div>
    )
}