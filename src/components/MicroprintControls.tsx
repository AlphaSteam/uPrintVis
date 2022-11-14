import React, { useState, SetStateAction, Dispatch } from "react";

import { PaintBucket, ZoomIn, ZoomOut } from 'lucide-react';
import FloatingButton from "./FloatingButton";

export default function MicroprintControls(props: {
    setCustomColors: Dispatch<SetStateAction<boolean>>,
    setFontSize: Dispatch<SetStateAction<number>>,
}) {
    const { setCustomColors, setFontSize } = props;

    const [showMicroprintControlsFullOpacity, setShowMicroprintControlsFullOpacity] = useState<boolean>(false);

    return (
        <div style={{
            marginTop: "0.5rem",
            marginRight: "0.3rem",
            padding: "1rem",
            opacity: showMicroprintControlsFullOpacity ? 1 : 0.3,
            backgroundColor: "gray",
            height: "min-content",
            borderRadius: "6px",
            transition: "opacity 0.1s",
        }}
            onMouseEnter={() => {
                setShowMicroprintControlsFullOpacity(true)
            }}
            onMouseLeave={() => setShowMicroprintControlsFullOpacity(false)}
        >
            <div style={{
                display: "flex",
                justifyContent: "end",
                marginBottom: "0.5rem"
            }}>
                <div style={{ marginRight: "0.2rem" }}>
                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
                            setFontSize((oldValue) => oldValue + 1)
                        }}>
                        <ZoomIn color="black" size="1rem" />
                    </FloatingButton>
                </div>

                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setFontSize((oldValue) => oldValue > 7 ? oldValue - 1 : oldValue)
                    }}>
                    <ZoomOut color="black" size="1rem" />
                </FloatingButton>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "end"
            }}>
                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setCustomColors((oldValue) => !oldValue)
                    }}>
                    <PaintBucket color="black" size="1rem" />
                </FloatingButton>
            </div>
        </div>
    )
}