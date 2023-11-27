import React, { useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect} from "react";
import MicroprintText from "../components/MicroprintText";
import Draggable from 'react-draggable';
import MicroprintControls from "../components/MicroprintControls";
import MicroprintSvg from "../components/MicroprintSvg"
import convertValueFromOneRangeToAnother from "../helpers/convertValueFromOneRangeToAnother"
import throttle from "../helpers/throttle"

export default function Microprint(props: {
    svgSource: string,
    db: IDBDatabase | null
}) {
    const { svgSource, db } = props;

    const fontSizeValue = parseInt(localStorage.getItem("fontSize") || "15", 10)

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

    //const textViewAreaScrollTop = useRef(null);

    const [textViewAreaScrollTop, setTextViewAreaScrollTop] = useState(0);

    const [textViewAreaHeight, setTextViewAreaHeight] = useState(0);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const textViewAreaRef = useRef<HTMLDivElement>(null);

    const [svgDivRef, setSvgDivRef] = useState<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);

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

    const getSvgScrollTop = useCallback(()=>{
        return convertValueFromTextToSvg(window.scrollY)
    },[window.scrollY, svgDivRef?.scrollHeight, svgDivRef?.clientHeight, textDivRef?.scrollHeight, textDivRef?.clientHeight])

    const getTextScrollHeight = useCallback(() => textDivRef?.scrollHeight || 0,[textDivRef])

    const getSvgScrollHeight = useCallback(() => svgDivRef?.scrollHeight || 0,[svgDivRef])

    const getSvgClientHeight = useCallback(() => svgDivRef?.clientHeight || 0,[svgDivRef])


    const getTextViewAreaHeight = useCallback(()=>{
        const textViewAreaHeight = convertValueFromOneRangeToAnother({
            value: window.visualViewport?.height || 0,
            oldMin: 0,
            oldMax: getTextScrollHeight(),
            newMin: 0,
            newMax: getSvgScrollHeight()
        })

        return (
            textViewAreaHeight
            )
    },[window.visualViewport?.height,svgDivRef, textDivRef])

    const getSvgClientHeightTop = useCallback(
            ()=> getSvgClientHeight() - textViewAreaHeight,
        [svgDivRef, textViewAreaHeight]
    )

    const getWindowInnerHeightTop = useCallback(
            ()=> window.innerHeight - textViewAreaHeight,
        [window.innerHeight, textViewAreaHeight]
    )

    const getTextViewArea = useCallback(()=>{
        const svgClientHeightTop = getSvgClientHeightTop();

        const windowInnerHeightTop = getWindowInnerHeightTop();

        return convertValueFromOneRangeToAnother({
            value: window.scrollY,
            oldMin: 0,
            oldMax: textDivRef?.scrollHeight || 0 - window.innerHeight,
            newMin: 0,
            newMax: getSvgClientHeight() ? Math.min(windowInnerHeightTop, svgClientHeightTop) : windowInnerHeightTop
        })  
    }, [textDivRef, window.innerHeight, svgDivRef])

    useEffect(()=>{
        console.log("bvbbbb", textViewAreaScrollTop)
    }, [textViewAreaScrollTop])

    const setTextViewAreaScrollTopThrottled = throttle((textViewArea: number) => {
        setTextViewAreaScrollTop(textViewArea); // Use setState here
      }, 1000);

    const handleScroll = () => {
        if (svgDivRef && textDivRef) {
          const svgScrollTop = getSvgScrollTop();
      
          svgDivRef.scrollTop = svgScrollTop;
      
          const textViewAreaHeight = getTextViewAreaHeight();
      
          const textViewArea = getTextViewArea();
      
          //if (!isDragging) setTextViewAreaScrollTopThrottled(textViewArea)   
      
          setTextViewAreaHeight(textViewAreaHeight)
        }
      }

      useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
      
        handleScroll();
      
        return () => window.removeEventListener("scroll", handleScroll);
      }, [textDivRef, textDivRef?.scrollHeight, svgDivRef, textViewAreaRef, isDragging]);


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
                    top: 0,
                    bottom: (svgDivRef?.clientHeight || 0) - textViewAreaHeight
                }}
                scale={1}
                defaultPosition={{x:0, y: 100 }}
                onDrag={(_e, ui) => {
                    setIsDragging(true);

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
                onStop={()=>{
                    setIsDragging(false);
                }}
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
            </Draggable >
       
    )

    const microprintAreaHeight = useMemo(()=> svgDivRef?.clientHeight ? Math.min(window.innerHeight,
        svgDivRef?.clientHeight) : "unset", [svgDivRef?.clientHeight, window.innerHeight])

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
                        useCustomColors={useCustomColors}
                        showRowNumbers={showRowNumbers}
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