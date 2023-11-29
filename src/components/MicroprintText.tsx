import React, { useEffect, useLayoutEffect,
    useState, useMemo, memo, Dispatch, SetStateAction, useRef } from "react"
import transformRectArrayIntoObject from "../helpers/transformArrayIntoObject"

export default memo( function MicroprintText(props: {
    fontFamily: string,
    textLines: SVGTextElement[],
    fontSize: number,
    svgRects: SVGRectElement[],
    useCustomColors: boolean,
    showRowNumbers: boolean,
    defaultColors: { background: string, text: string },
    setMicroprintTextHasLoaded:Dispatch<SetStateAction<Boolean>>
}) {
    const {
        textLines,
        fontSize,
        svgRects,
        useCustomColors,
        fontFamily,
        defaultColors,
        showRowNumbers,
        setMicroprintTextHasLoaded,
    } = props;

    const linesRef = useRef<HTMLDivElement>(null)

    const [parsedSvgRects, setParsedSvgRects] = useState(null);

    const memoizedSvgRects = useMemo(() => svgRects, [svgRects])

    useEffect(() => {
        setParsedSvgRects(transformRectArrayIntoObject(svgRects))
    }, [memoizedSvgRects])

    const memoizedTextLines = useMemo(() => {
        return textLines
    }, [textLines])
    

    useEffect(() => {
        const observer = new MutationObserver(() => {
          if (linesRef.current) {
            const allLinesRenderedNow = linesRef.current.childNodes.length === textLines.length;

            if (allLinesRenderedNow && textLines.length > 0) {
                setMicroprintTextHasLoaded(true);
            }
          }
        });
    
        if (linesRef.current) {
          observer.observe(linesRef.current, { childList: true });
        }
    
        return () => {
          observer.disconnect();
        };
      }, [textLines]);
    
    
    const getTextColor = (textLine: SVGTextElement) => {
        const textColor = textLine.attributes.getNamedItem("fill")?.value;

        if (useCustomColors) {
            return textColor
        }

        return defaultColors?.text || "black"
    }

    const getBackgroundColor = (rect: SVGRectElement) => {
        const rectAttributes: NamedNodeMap = rect && rect["attributes"]

        const backgroundColor = rectAttributes ?
            rectAttributes.getNamedItem("fill")!.value : undefined;

        if (useCustomColors) {
            return backgroundColor || defaultColors?.background || "white"
        }

        return defaultColors?.background || "black"
    }

    const renderRowNumbers = useMemo(() => {
        return (
            <div style={{
                paddingRight: "1rem",
                paddingLeft: "0.5rem",
                textAlign: "end",
                backgroundColor: defaultColors?.background,
                color: defaultColors?.text,
                width: "min-content"
            }}>
                {memoizedTextLines.map((_textLine: SVGTextElement, index: number) => {
                    return (
                        <span
                            style={{
                                display: "block",
                                fontSize,
                                fontFamily,
                            }}
                            key={index}
                        >
                            {index}
                        </span>
                    )
                })}
            </div>
        )
    }, [memoizedTextLines, defaultColors])

    const renderMicroprintTextMemoized = useMemo(() => (
        <div style={{
            paddingLeft: showRowNumbers ? 0 : "0.5rem",
            flexGrow: "1",  
        }}
        ref={linesRef}
        >
            {memoizedTextLines.map((textLine: SVGTextElement, index: number) => {   
                const lineNumber = textLine?.attributes?.getNamedItem("data-text-line")?.value || index.toString();

                const rect: SVGRectElement | null = parsedSvgRects && parsedSvgRects[lineNumber];

                if (!rect || !rect["attributes"]) return


                return (
                    <span
                        style={{
                            display: "block",
                            fontSize,
                            color: getTextColor(textLine),
                            backgroundColor: getBackgroundColor(rect),
                            fontFamily,
                        }}
                        id={`rendered-line-${lineNumber}`}
                        key={lineNumber}
                    >
                        {textLine.textContent} <br />
                    </span>)
            })}
        </div>
        ),
        [   parsedSvgRects,
            memoizedTextLines, 
            showRowNumbers, 
            fontSize, 
            fontFamily, 
            getTextColor, 
            getBackgroundColor,
            defaultColors,
        ])

    return (
        <>
            <div style={{
                "overflow": "auto",
                "whiteSpace": "pre",
                display: "flex",
                backgroundColor: defaultColors?.background,
            }}>
                {showRowNumbers && (renderRowNumbers)}

                {renderMicroprintTextMemoized}
            </div >
        </>

    )
})