import React, { useState, SetStateAction, Dispatch, ReactNode } from "react";

import {
    PaintBucket,
    ZoomIn,
    ZoomOut,
    Search,
    ListOrdered,
    Home,
    RotateCcw,
    Settings,
    Check,
    X
} from 'lucide-react';
import FloatingButton from "./FloatingButton";

export default function MicroprintControls(props: {
    setUseCustomColors: Dispatch<SetStateAction<boolean>>,
    useCustomColors: boolean,
    setFontSize: Dispatch<SetStateAction<number>>,
    fontSize: number,
    setShowRowNumbers: Dispatch<SetStateAction<boolean>>,
    showRowNumbers: boolean,
    setSearch: Dispatch<SetStateAction<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>>,
}) {
    const {
        setUseCustomColors,
        useCustomColors,
        setFontSize,
        fontSize,
        setSearch,
        setShowRowNumbers,
        showRowNumbers,
    } = props;

    const [showMicroprintControlsFullOpacity, setShowMicroprintControlsFullOpacity] = useState<boolean>(false);

    const showSettingsValue = localStorage.getItem("showSettings") ?
        localStorage.getItem("showSettings") === "true" : true

    const [showSettings, setShowSettings] = useState<boolean>(showSettingsValue);

    const [searchValue, setSearchValue] = useState<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>({
        searchText: "",
        backgroundColor: "black",
        textColor: "white"
    });

    const renderControlLabel = (content: ReactNode) => {
        return (
            <span
                style={{
                    alignSelf: "center",
                    marginRight: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#242323",
                    borderRadius: "6px",
                    flexGrow: "1"
                }}
            >
                {content}
            </span>)
    }

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
                        localStorage.removeItem("svgSource");

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
                justifyContent: "space-between",
                marginBottom: "0.5rem"
            }}>
                {renderControlLabel(`Font size: ${fontSize}`)}

                <div style={{ marginRight: "0.5rem" }}>
                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
                            setFontSize((oldValue) => {
                                const newValue = oldValue > 7
                                    ? oldValue - 1 : oldValue

                                localStorage.setItem("fontSize", (newValue).toString());

                                return newValue;
                            })
                        }}>
                        <ZoomOut color="black" size={19} />
                    </FloatingButton>
                </div>

                <div style={{ marginRight: "1rem" }}>
                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
                            setFontSize((oldValue) => {
                                localStorage.setItem("fontSize", (oldValue + 1).toString());

                                return oldValue + 1
                            })


                        }}>
                        <ZoomIn color="black" size={19} />
                    </FloatingButton>
                </div>

                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setFontSize(15)
                    }}>
                    <RotateCcw color="black" size={19} />
                </FloatingButton>
            </div>
        )
    }

    const renderIconLabel = (label: string, value: boolean) => {

        const valueIcon = value ? <Check /> : <X />

        return (
            <div style={{
                alignItems: "center",
                display: "flex"
            }}>
                <span style={{
                    marginRight: "0.5rem"
                }}>
                    {label}
                </span>

                {valueIcon}
            </div>
        )
    }

    const renderRowNumbersInput = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem"
            }}>
                {renderControlLabel(renderIconLabel("Show row numbers:", showRowNumbers))}

                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setShowRowNumbers((oldValue) => {
                            localStorage.setItem("showRowNumbers", (!oldValue).toString());

                            return !oldValue
                        })
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
                justifyContent: "space-between",
                marginBottom: "0.8rem"
            }}>
                {renderControlLabel(renderIconLabel("Show custom colors:", useCustomColors))}

                <FloatingButton
                    backgroundColor="white"
                    size="2rem"
                    onClick={() => {
                        setUseCustomColors((oldValue) => {
                            localStorage.setItem("showCustomColors", (!oldValue).toString());

                            return !oldValue
                        })
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
                        const updateValue = (oldValue: {
                            searchText: string;
                            backgroundColor: string;
                            textColor: string;
                        }) => {
                            const newValue = { ...oldValue }

                            return { ...newValue, backgroundColor: event.target.value }
                        }

                        setSearch(updateValue)

                        setSearchValue(updateValue)
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

    const renderShowSettingsButton = () => {
        return (
            <FloatingButton
                backgroundColor="white"
                size="2rem"
                onClick={() => {
                    setShowSettings((oldValue) => {
                        localStorage.setItem("showSettings", (!oldValue).toString());

                        return !oldValue
                    });
                }}>
                <Settings color="black" size={19} />
            </FloatingButton>
        )
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "end",
                marginTop: "0.5rem"
            }}>
                {renderShowSettingsButton()}
            </div>

            {showSettings && (
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
            )}

        </div>

    )
}