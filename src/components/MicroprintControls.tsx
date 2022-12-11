import React, { useState, SetStateAction, Dispatch } from "react";

import {
    PaintBucket,
    ZoomIn,
    ZoomOut,
    Search,
    ListOrdered,
    Home
} from 'lucide-react';
import FloatingButton from "./FloatingButton";

export default function MicroprintControls(props: {
    setCustomColors: Dispatch<SetStateAction<boolean>>,
    setFontSize: Dispatch<SetStateAction<number>>,
    setRowNumbers: Dispatch<SetStateAction<boolean>>,
    setSearch: Dispatch<SetStateAction<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>>,
}) {
    const { setCustomColors, setFontSize, setSearch, setRowNumbers } = props;

    const [showMicroprintControlsFullOpacity, setShowMicroprintControlsFullOpacity] = useState<boolean>(false);

    const [searchValue, setSearchValue] = useState<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>({ searchText: "", backgroundColor: "black", textColor: "white" });

    const renderFileLoadInput = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "end",
                marginBottom: "0.5rem"
            }}>
                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        localStorage.clear();
                        window.location.assign("/microprint-visualizer/");
                    }}>
                    <Home color="black" size={19} />
                </FloatingButton>
            </div>
        )
    }

    const renderFontSizeInputs = () => {
        return (
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
                            setFontSize((oldValue) => oldValue > 7
                                ? oldValue - 1 : oldValue)
                        }}>
                        <ZoomOut color="black" size={19} />
                    </FloatingButton>
                </div>

                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setFontSize((oldValue) => oldValue + 1)
                    }}>
                    <ZoomIn color="black" size={19} />
                </FloatingButton>
            </div>
        )
    }

    const renderRowNumbersInput = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "end",
                marginBottom: "0.5rem"
            }}>
                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setRowNumbers((oldValue) => !oldValue)
                    }}>
                    <ListOrdered color="black" size={19} />
                </FloatingButton>
            </div>
        )
    }

    const renderDefaultColorInput = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "end",
                marginBottom: "0.8rem"
            }}>
                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setCustomColors((oldValue) => !oldValue)
                    }}>
                    <PaintBucket color="black" size={19} />
                </FloatingButton>
            </div>
        )
    }

    const renderSearchInput = () => {
        return (
            <div style={{
                backgroundColor: "darkgray",
                padding: "0.5rem",
                borderRadius: "6px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "0.5rem",
                }}>
                    <input
                        style={{ borderRadius: "6px", marginRight: "0.5rem" }}
                        onChange={(event) => {
                            setSearchValue((oldValue) => {
                                const newValue = { ...oldValue }
                                return { ...newValue, searchText: event.target.value }
                            })
                        }}
                    />

                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
                            setSearch(searchValue)
                        }}>
                        <Search color="black" size={19} />
                    </FloatingButton>
                </div>

                <div style={{
                    marginBottom: "0.2rem",
                    display: "flex"
                }}>
                    <span
                        style={{ marginRight: "0.5rem", color: "white" }}
                    >
                        Background color:
                    </span>

                    <input type="color" onChange={(event) => {
                        setSearch((oldValue) => {
                            const newValue = { ...oldValue }
                            return { ...newValue, backgroundColor: event.target.value }
                        })
                        setSearchValue((oldValue) => {
                            const newValue = { ...oldValue }
                            return { ...newValue, backgroundColor: event.target.value }
                        })
                    }} />
                </div>

                <div style={{
                    display: "flex"
                }}
                >
                    <span style={{ marginRight: "0.5rem", color: "white" }}>
                        Text color:
                    </span>

                    <input type="color" onChange={(event) => {
                        setSearch((oldValue) => {
                            const newValue = { ...oldValue }
                            return { ...newValue, textColor: event.target.value }
                        })
                        setSearchValue((oldValue) => {
                            const newValue = { ...oldValue }
                            return { ...newValue, textColor: event.target.value }
                        })
                    }} />
                </div>
            </div>
        )
    }

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
            {renderFileLoadInput()}

            {renderFontSizeInputs()}

            {renderDefaultColorInput()}

            {renderRowNumbersInput()}

            {renderSearchInput()}
        </div>
    )
}