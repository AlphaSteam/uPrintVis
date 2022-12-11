import React, { useEffect, useState, useRef, useCallback } from "react";
import MicroprintText from "./MicroprintText";
import Draggable from 'react-draggable';
import MicroprintControls from "./MicroprintControls";
import MicroprintSvg from "./MicroprintSvg"
import convertValueFromOneRangeToAnother from "../helpers/convertValueFromOneRangeToAnother"

export default function Microprint(props: {
    svgSource: string
}) {
    const { svgSource } = props;

    const [fontSize, setFontSize] = useState(15)
    const [fontFamily, setFontFamily] = useState("monospace")

    const [defaultBackgroundColor, setDefaultBackgroundColor] = useState("white")
    const [defaultTextColor, setDefaultTextColor] = useState("black")

    const [customColors, setCustomColors] = useState(true);

    const [rowNumbers, setRowNumbers] = useState(true);

    const [textViewAreaScrollTop, setTextViewAreaScrollTop] = useState(0);
    const [textViewAreaHeight, setTextViewAreaHeight] = useState(0);

    const [textViewAreaVisible, setTextViewAreaVisible] = useState(false);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const textViewAreaRef = useRef<HTMLDivElement>(null);

    const [svgDivRef, setSvgDivRef] = useState<HTMLDivElement | null>(null);

    const [search, setSearch] = useState<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>({ searchText: "", backgroundColor: "black", textColor: "white" });

    const svgDivRefCallback = useCallback((node: HTMLDivElement) => {
        if (node) {
            setSvgDivRef(node)
        }
    }, [])

    const [textDivRef, setTextDivRef] = useState<HTMLDivElement | null>(null);

    const textDivRefCallback = useCallback((node: HTMLDivElement) => {
        if (node) {
            setTextDivRef(node)
        }
    }, [])

    const convertValueFromTextToSvg = (value: number) => {
        if (svgDivRef && textDivRef) {
            const maxSvgScroll = svgDivRef.scrollHeight - svgDivRef.clientHeight;

            const textScrollHeight = textDivRef.scrollHeight - textDivRef.clientHeight;

            value = convertValueFromOneRangeToAnother({
                value,
                oldMin: 0,
                oldMax: textScrollHeight,
                newMin: 0,
                newMax: maxSvgScroll
            })
        }

        return value;
    }

    useEffect(() => {
        const handleScroll = () => {
            if (svgDivRef && textDivRef) {
                const textScrollHeight = textDivRef.scrollHeight;
                const svgScrollHeight = svgDivRef.scrollHeight;

                const svgClientHeight = svgDivRef?.clientHeight;

                const svgScrollTop = convertValueFromTextToSvg(window.scrollY)

                svgDivRef.scrollTop = svgScrollTop;

                const viewPortHeight = window.visualViewport.height

                const textViewAreaHeight = convertValueFromOneRangeToAnother({
                    value: viewPortHeight,
                    oldMin: 0,
                    oldMax: textScrollHeight,
                    newMin: 0,
                    newMax: svgScrollHeight
                })

                const svgClientHeightTop = svgClientHeight - textViewAreaHeight;

                const windowInnerHeightTop = window.innerHeight - textViewAreaHeight;

                const textViewAreaScrollTop = convertValueFromOneRangeToAnother({
                    value: window.scrollY,
                    oldMin: 0,
                    oldMax: textDivRef.scrollHeight - window.innerHeight,
                    newMin: 0,
                    newMax: svgClientHeight ? Math.min(windowInnerHeightTop, svgClientHeightTop) : windowInnerHeightTop
                })

                setTextViewAreaScrollTop(textViewAreaScrollTop);

                setTextViewAreaHeight(textViewAreaHeight)
            }
        }

        window.addEventListener("scroll", handleScroll);

        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [textDivRef, textDivRef?.scrollHeight, svgDivRef]);

    const getMostCommonBackgroundColor = (rects: SVGRectElement[]) => {
        const colorCounts: { [n: string]: number } = {};

        rects.forEach((rect) => {

            const rectAttributes: NamedNodeMap | null = rect && rect["attributes"];

            const backgroundColor = rectAttributes ?
                rectAttributes.getNamedItem("fill")!.value : undefined;

            if (backgroundColor) {
                colorCounts[backgroundColor] = colorCounts[backgroundColor] ?
                    colorCounts[backgroundColor] + 1 : 1;
            }
        })

        return Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    }

    const getMostCommonTextColor = (texts: SVGTextElement[]) => {
        const colorCounts: { [n: string]: number } = {};

        texts.forEach((textLine) => {

            const textColor = textLine.attributes.getNamedItem("fill")?.value;


            if (textColor) {
                colorCounts[textColor] = colorCounts[textColor] ? colorCounts[textColor] + 1 : 1;
            }
        })

        return Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    }

    const setDefaultBackgroundColors = (rects: SVGRectElement[]) => {
        const firstRect = rects[0];

        const firstRectAttributes: NamedNodeMap | null = firstRect && firstRect["attributes"];

        if (!firstRectAttributes) return;

        const firstBackgroundColor = firstRectAttributes ?
            firstRectAttributes.getNamedItem("fill")!.value : undefined;

        if (firstBackgroundColor) {
            setDefaultBackgroundColor(firstBackgroundColor);
        }
        else {
            setDefaultBackgroundColor(getMostCommonBackgroundColor(rects))
        }
    }

    const setDefaultTextColors = (texts: SVGTextElement[], textGroup: SVGGElement) => {
        const color: string | undefined = textGroup?.attributes?.getNamedItem("fill")?.value;

        if (color) {
            setDefaultTextColor(color);
        }
        else {
            setDefaultTextColor(getMostCommonTextColor(texts))
        }
    }

    const setDefaultColors = (rects: SVGRectElement[],
        texts: SVGTextElement[], textGroup: SVGGElement) => {
        setDefaultBackgroundColors(rects);
        setDefaultTextColors(texts, textGroup);
    }

    const renderTextViewArea = () => (
        <Draggable
            nodeRef={textViewAreaRef}
            axis="y"
            bounds={{
                top: -textViewAreaScrollTop, bottom: (svgDivRef?.clientHeight || 0)
                    - textViewAreaHeight
            }}
            scale={1}
            position={{ x: 0, y: textViewAreaScrollTop }}
            onDrag={(_e, ui) => {
                if (textDivRef) {
                    const textScrollHeight = textDivRef.scrollHeight;

                    const svgScrollHeight = svgDivRef?.scrollHeight;

                    const windowInnerHeightTop = window.innerHeight - textViewAreaHeight;

                    const moveValue = convertValueFromOneRangeToAnother({
                        value: ui.y,
                        oldMin: 0,
                        oldMax: svgScrollHeight ? Math.min(svgScrollHeight - textViewAreaHeight,
                            windowInnerHeightTop) : windowInnerHeightTop,
                        newMin: 0,
                        newMax: textScrollHeight - window.innerHeight
                    })

                    window.scrollTo(0, moveValue)
                }
            }
            }
        >
            <div
                ref={textViewAreaRef}
                style={{
                    transition: "opacity 0.1s",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    height: textViewAreaHeight,
                    position: "absolute",
                    width: "100%",
                    opacity: textViewAreaVisible ? "100" : "0"
                }} />
        </Draggable >
    )

    return (
        <div style={{
            display: "flex",
        }}>
            <div style={{
                flexGrow: "1",
                backgroundColor: defaultBackgroundColor,
                color: defaultTextColor
            }}>

                <div style={{
                    position: "fixed",
                    right: svgDivRef?.clientWidth && svgDivRef?.clientWidth + 10,
                    display: "flex",
                    height: "min-content",
                }}>
                    <MicroprintControls
                        setCustomColors={setCustomColors}
                        setFontSize={setFontSize}
                        setSearch={setSearch}
                        setRowNumbers={setRowNumbers}
                    />
                </div>

                <div style={{
                    position: "fixed",
                    right: 0,
                    display: "flex",
                    height: svgDivRef?.clientHeight ? Math.min(window.innerHeight,
                        svgDivRef?.clientHeight) : "unset",
                }}
                    onMouseEnter={(() => {
                        setTextViewAreaVisible(true);
                    })}
                    onMouseLeave={(() => setTextViewAreaVisible(false))}
                >
                    {renderTextViewArea()}

                    <div ref={svgDivRefCallback} style={{
                        overflow: "hidden",
                        boxShadow: "-4px 2px 5px 0px rgba(0,0,0,0.4)",
                        paddingLeft: "0.3rem",
                        backgroundColor: defaultBackgroundColor,
                        userSelect: "none"
                    }}
                    >
                        <MicroprintSvg
                            svgSource={svgSource}
                            setSvgTextLines={setSvgTextLines}
                            setFontFamily={setFontFamily}
                            setSvgRects={setSvgRects}
                            setDefaultColors={setDefaultColors}
                            search={search}
                        />
                    </div>
                </div>

                <div style={{
                    height: "100vh",
                }} ref={textDivRefCallback} >
                    <MicroprintText
                        fontFamily={fontFamily}
                        textLines={svgTextLines || []}
                        fontSize={fontSize}
                        svgRects={svgRects}
                        customColors={customColors}
                        rowNumbers={rowNumbers}
                        defaultColors={{
                            background: defaultBackgroundColor,
                            text: defaultTextColor
                        }}
                    />
                </div>
            </div>
        </div >
    )
}