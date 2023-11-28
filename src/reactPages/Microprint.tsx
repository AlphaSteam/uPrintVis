import React, { useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect} from "react";
import MicroprintText from "../components/MicroprintText";
import Draggable from 'react-draggable';
import MicroprintControls from "../components/MicroprintControls";
import MicroprintSvg from "../components/MicroprintSvg"
import convertValueFromOneRangeToAnother from "../helpers/convertValueFromOneRangeToAnother"
import { throttle } from 'lodash';
import LoadingMessage from "../components/LoadingMessage";

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
    const [textViewAreaHeight, setTextViewAreaHeight] = useState(0);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const textViewAreaRef = useRef<HTMLDivElement>(null);
    
    const [svgDivRef, setSvgDivRef] = useState<HTMLDivElement | null>(null);
    const [svgDivRefLoaded, setSvgDivRefLoaded] = useState(false);

    const [isDragging, setIsDragging] = useState(false);

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

    const [isLoadingMicroprint, setIsLoadingMicroprint] = useState(true);

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

    const getSvgClientHeight = useCallback(() => svgDivRef?.clientHeight || 0,[svgDivRef])

    const getSvgClientHeightTop = useCallback(
            ()=> getSvgClientHeight() - textViewAreaHeight,
        [svgDivRef, textViewAreaHeight]
    )

    const getWindowInnerHeightTop = useCallback(
            ()=> window.innerHeight - textViewAreaHeight,
        [window.innerHeight, textViewAreaHeight]
    )


    const getTextScrollHeight = useCallback(() => textDivRef?.scrollHeight || 0,[textDivRef])

    const getSvgScrollHeight = useCallback(() => svgDivRef?.scrollHeight || 0,[svgDivRef])

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




/*     const [textViewAreaScrollTop, setTextViewAreaScrollTop] = useState(0);
  
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = React.useRef(0);
    const previousTimeRef = React.useRef(0);
    
    const animate =  (time : number) => {
      if (previousTimeRef.current != undefined) {
        const deltaTime = time - previousTimeRef.current;
        
        // Pass on a function to the setter of the state
        // to make sure we always have the latest state
        setTextViewAreaScrollTop(prevTextViewAreaScrollTop => (prevTextViewAreaScrollTop + deltaTime * 0.01) % 100);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    }
    
    React.useEffect(() => {
      requestRef.current = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(requestRef.current);
    }, []);
     */





    const setTextViewAreaScrollTopDebounce = throttle((textViewArea) => {
        setTextViewAreaScrollTop(textViewArea);
      }, 1000) 

    const handleScroll = () => {
        if (svgDivRef && textDivRef) {
          const svgScrollTop = getSvgScrollTop();
      
          svgDivRef.scrollTop = svgScrollTop;

          const newTextViewAreaHeight = getTextViewAreaHeight();

          setTextViewAreaHeight(newTextViewAreaHeight)
          
          const textViewAreaScrollTop = getTextViewAreaScrollTop(newTextViewAreaHeight);

          if (!isDragging) setTextViewAreaScrollTopDebounce(textViewAreaScrollTop)   
        }
      }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
    
        handleScroll();
    
        return () => window.removeEventListener("scroll", handleScroll);
    }, [textDivRef, textDivRef?.scrollHeight, svgDivRef, textViewAreaRef, isDragging]);


















    

    const getTextViewAreaHeight = useCallback(()=>{
        const textViewAreaHeight = convertValueFromOneRangeToAnother({
            value: window.visualViewport?.height || 0,
            oldMin: 0,
            oldMax: getTextScrollHeight(),
            newMin: 0,
            newMax: getSvgScrollHeight()
        })

        return (textViewAreaHeight)
    },[window.visualViewport?.height,svgDivRef, textDivRef])


    useEffect(()=>{
        if (textDivRefLoaded && svgDivRefLoaded){
            setIsLoadingMicroprint(false);
        }
    },[textDivRefLoaded, svgDivRefLoaded])

    

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
                position={{x: 0, y: textViewAreaScrollTop}}
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
        </>
    )       
}