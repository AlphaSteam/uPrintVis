import { useEffect, useState, useMemo } from "react"
import transformRectArrayIntoObject from "../helpers/transformArrayIntoObject"

export default function MicroprintText(props: {
    fontFamily: string,
    textLines: SVGTextElement[],
    fontSize: number,
    svgRects: SVGRectElement[],
    useCustomColors: boolean,
    showRowNumbers: boolean,
    defaultColors: { background: string, text: string }
}) {
    const {
        textLines,
        fontSize,
        svgRects,
        useCustomColors,
        fontFamily,
        defaultColors,
        showRowNumbers
    } = props;

    const [parsedSvgRects, setParsedSvgRects] = useState(null);

    const memoizedSvgRects = useMemo(() => svgRects, [svgRects])

    useEffect(() => {
        setParsedSvgRects(transformRectArrayIntoObject(svgRects))
    }, [memoizedSvgRects])

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

    const renderRowNumbers = () => {
        return (
            <div style={{
                paddingRight: "1rem",
                paddingLeft: "0.5rem",
                textAlign: "end",
                backgroundColor: defaultColors?.background,
                color: defaultColors?.text,
                width: "min-content"
            }}>
                {textLines.map((_textLine: SVGTextElement, index: number) => {
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
    }

    return (
        <>
            <div style={{
                "overflow": "auto",
                "whiteSpace": "nowrap",
                display: "flex",
                backgroundColor: defaultColors?.background,
            }}>
                {showRowNumbers && (renderRowNumbers())}

                <div style={{
                    paddingLeft: showRowNumbers ? 0 : "0.5rem",
                    flexGrow: "1",
                }}>
                    {textLines.map((textLine: SVGTextElement, index: number) => {
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

            </div >
        </>

    )
}