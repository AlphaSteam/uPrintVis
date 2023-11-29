import React, { useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect} from "react";
import MicroprintText from "../components/MicroprintText";
import Draggable from 'react-draggable';
import MicroprintControls from "../components/MicroprintControls";
import MicroprintSvg from "../components/MicroprintSvg"
import convertValueFromOneRangeToAnother from "../helpers/convertValueFromOneRangeToAnother"
import LoadingMessage from "../components/LoadingMessage";

export default function Microprint(props: {
    svgSource: string,
    db: IDBDatabase | null
}) {
    const { svgSource, db } = props;

    const fontSizeValue = parseInt(localStorage.getItem("fontSize") || "15", 10)

    const [isLoadingMicroprint, setIsLoadingMicroprint] = useState(true);

    const [fontSize, setFontSize] = useState(fontSizeValue)
    const [fontFamily, setFontFamily] = useState("monospace")

    const [defaultBackgroundColor, setDefaultBackgroundColor] = useState("white")
    const [defaultTextColor, setDefaultTextColor] = useState("black")

    const useCustomColorsValue = localStorage.getItem("showCustomColors") ?
        localStorage.getItem("showCustomColors") === "true" : true

    const [useCustomColors, setUseCustomColors] = useState(useCustomColorsValue);

    const showRowNumbersValue = localStorage.getItem("showRowNumbers") ?
        localStorage.getItem("showRowNumbers") === "true" : true

    const [showRowNumbers, setShowRowNumbers] = useState(showRowNumbersValue);

    const [textViewAreaScrollTop, setTextViewAreaScrollTop] = useState(0);
    const [textViewAreaHeight, setTextViewAreaHeight] = useState(0);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const textViewAreaRef = useRef<HTMLDivElement>(null);
    
    const [svgDivRef, setSvgDivRef] = useState<HTMLDivElement | null>(null);
    const [svgDivRefLoaded, setSvgDivRefLoaded] = useState(false);
    const [microprintTextHasLoaded, setMicroprintTextHasLoaded] = useState<Boolean>(false);

    const [search, setSearch] = useState<{
        searchText: string,
        backgroundColor: string,
        textColor: string
    }>({ searchText: "", backgroundColor: "black", textColor: "white" });

    const svgDivRefCallback = useCallback((node: HTMLDivElement) => {
        if (node !== null) {
            setSvgDivRef(node)
            setSvgDivRefLoaded(true)
        }
    }, [])

    const [textDivRef, setTextDivRef] = useState<HTMLDivElement | null>(null);
    const [textDivRefLoaded, setTextDivRefLoaded] = useState(false);

    const textDivRefCallback = useCallback((node: HTMLDivElement) => {
        if (node !== null) {
            setTextDivRef(node)
            setTextDivRefLoaded(true)
        }
    }, [])

    const convertValueFromTextToSvg = useCallback((value: number) => {
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
    },[svgDivRef, textDivRef])

    const getSvgScrollTop = useCallback(()=>{
        return convertValueFromTextToSvg(window.scrollY)
    },[window.scrollY, svgDivRef?.scrollHeight, svgDivRef?.clientHeight, textDivRef?.scrollHeight, textDivRef?.clientHeight])


    const getTextViewAreaScrollTop = useCallback((textViewAreaHeight: number)=>{
        if (textDivRef) {
            const textScrollHeight = textDivRef.scrollHeight;

            const svgScrollHeight = svgDivRef?.scrollHeight;

            const windowInnerHeightTop = window.innerHeight - textViewAreaHeight;

            return convertValueFromOneRangeToAnother({
                value: window.scrollY,
                oldMin: 0,
                oldMax: textScrollHeight - window.innerHeight,
                newMin: 0,
                newMax: svgScrollHeight ? Math.min(svgScrollHeight - textViewAreaHeight,
                    windowInnerHeightTop) : windowInnerHeightTop
            }) 
        }
    }, [textDivRef, window.innerHeight, svgDivRef])

    const getTextViewAreaHeight = useCallback(()=>{
        const textViewAreaHeight = convertValueFromOneRangeToAnother({
            value: window.visualViewport?.height || 0,
            oldMin: 0,
            oldMax: textDivRef?.scrollHeight || 0,
            newMin: 0,
            newMax: svgDivRef?.scrollHeight || 0
        })

        return (textViewAreaHeight)
    },[window.visualViewport?.height,svgDivRef, textDivRef])


    useEffect(() => {
        const handleScroll = () => {
            if (svgDivRef && textDivRef) {
                const svgScrollTop = getSvgScrollTop();
          
                svgDivRef.scrollTop = svgScrollTop;
    
                const newTextViewAreaHeight = getTextViewAreaHeight();
    
                setTextViewAreaHeight(newTextViewAreaHeight)
              
                const textViewAreaScrollTop = getTextViewAreaScrollTop(newTextViewAreaHeight) || 0;

                setTextViewAreaScrollTop(textViewAreaScrollTop);
            }
          }

        window.addEventListener("scroll", handleScroll, { passive: true });
    
        handleScroll();
    
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [textDivRef, textDivRef?.scrollHeight, svgDivRef, textViewAreaRef]);


    useEffect(()=>{
        if (textDivRefLoaded && svgDivRefLoaded && microprintTextHasLoaded){
            setIsLoadingMicroprint(false);
        }
    },[textDivRefLoaded, svgDivRefLoaded, microprintTextHasLoaded])


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

    const renderTextViewArea = useMemo(() => {
        return( <Draggable
            nodeRef={textViewAreaRef}
            axis="y"
            bounds={{
                top: 0,
                bottom: (svgDivRef?.clientHeight || 0) - textViewAreaHeight
            }}
            scale={1}
            position={{x: 0, y: textViewAreaScrollTop}}
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
                    
                    window.scroll({top: moveValue, behavior: "instant"})
                }
            }
            }
        >
            <div
                style={{
                    transition: "opacity 0.3s",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    height: textViewAreaHeight,
                    position: "absolute",
                    width: "100%",
                    opacity: "0"
                }}
                ref={textViewAreaRef}
            />
        </Draggable >)
    }
    ,[textViewAreaHeight, textViewAreaScrollTop, svgDivRef?.clientHeight, textDivRef?.scrollHeight, svgDivRef?.scrollHeight, window.innerHeight, textViewAreaRef, svgDivRef, textDivRef])

    const microprintAreaHeight = useMemo(
        ()=> svgDivRef?.clientHeight ? 
            Math.min(window.innerHeight, svgDivRef?.clientHeight) : "unset", 
    [svgDivRef?.clientHeight, window.innerHeight]
    )

    const renderMicroprintTextMemoized =  useMemo(()=>(
                                <MicroprintText
                                    fontFamily={fontFamily}
                                    textLines={svgTextLines || []}
                                    fontSize={fontSize}
                                    svgRects={svgRects}
                                    useCustomColors={useCustomColors}
                                    showRowNumbers={showRowNumbers}
                                    defaultColors={{
                                        background: defaultBackgroundColor,
                                        text: defaultTextColor
                                    }}
                                    setMicroprintTextHasLoaded={setMicroprintTextHasLoaded}
                                />
    ),[svgTextLines, 
        fontSize, 
        svgRects, 
        useCustomColors, 
        showRowNumbers, 
        defaultBackgroundColor, 
        defaultTextColor, 
        fontFamily,
        microprintTextHasLoaded,
        setMicroprintTextHasLoaded
    ]
    )

    const renderMicroprintSVGMemoized = useMemo(
        ()=>(
                                <MicroprintSvg
                                    svgSource={svgSource}
                                    setSvgTextLines={setSvgTextLines}
                                    setFontFamily={setFontFamily}
                                    setSvgRects={setSvgRects}
                                    setDefaultColors={setDefaultColors}
                                    search={search}
                                />
    ),[svgSource, setSvgTextLines, setFontFamily, setSvgRects, setDefaultColors, search])

    const renderMicroprintControlsMemoized = useMemo(
        ()=>(
                                <MicroprintControls
                                    setUseCustomColors={setUseCustomColors}
                                    useCustomColors={useCustomColors}
                                    setFontSize={setFontSize}
                                    fontSize={fontSize}
                                    setSearch={setSearch}
                                    setShowRowNumbers={setShowRowNumbers}
                                    showRowNumbers={showRowNumbers}
                                    svgSource={svgSource}
                                    db={db}
                                />
    ),[setUseCustomColors, useCustomColors, setFontSize, fontSize, setSearch, setShowRowNumbers, showRowNumbers, svgSource, db])

    return (
        <>  
            <div style={{
                display: isLoadingMicroprint ? "flex": "none",
            }}>
                <LoadingMessage message="Loading..."/>
            </div>

            <div style={{
                display: isLoadingMicroprint ? "none": "flex",
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
                        {renderMicroprintControlsMemoized}
                    </div>

                    <div style={{
                        position: "fixed",
                        right: 0,
                        display: "flex",
                        height: microprintAreaHeight,
                    }}
                        onMouseEnter={(() => {
                            textViewAreaRef?.current?.style?.setProperty("opacity", "100")
                        })}
                        onMouseLeave={(() => {
                            textViewAreaRef?.current?.style?.setProperty("opacity", "0")
                        })}
                    >
                        {renderTextViewArea}

                        <div ref={svgDivRefCallback} style={{
                            overflow: "hidden",
                            boxShadow: "-4px 2px 5px 0px rgba(0,0,0,0.4)",
                            paddingLeft: "0.3rem",
                            backgroundColor: defaultBackgroundColor,
                            userSelect: "none"
                        }}
                        >
                           {renderMicroprintSVGMemoized}
                        </div>
                    </div>

                    <div style={{
                        height: "100vh",
                    }} ref={textDivRefCallback} >
                        {renderMicroprintTextMemoized}
                    </div>
                </div>
            </div >
        </>
    )       
}