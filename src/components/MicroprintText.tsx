import { useEffect, useState, useMemo } from "react"
import transformRectArrayIntoObject from "../helpers/transformArrayIntoObject"

export default function MicroprintText(props: {
    fontFamily: string,
    textLines: SVGTextElement[],
    fontSize: number,
    svgRects: SVGRectElement[],
    customColors: boolean,
    defaultColors: { background: string, text: string }
}) {
    const {
        textLines,
        fontSize,
        svgRects,
        customColors,
        fontFamily,
        defaultColors,
    } = props;

    const [parsedSvgRects, setParsedSvgRects] = useState(null);

    const memoizedSvgRects = useMemo(() => svgRects, [svgRects])

    useEffect(() => {
        setParsedSvgRects(transformRectArrayIntoObject(svgRects))
    }, [memoizedSvgRects])

    const getTextColor = (textLine: SVGTextElement) => {
        const textColor = textLine.attributes.getNamedItem("fill")?.value;

        if (customColors) {
            return textColor
        }

        return defaultColors?.text || "black"
    }

    const getBackgroundColor = (rect: SVGRectElement) => {
        const rectAttributes: NamedNodeMap = rect && rect["attributes"]

        const backgroundColor = rectAttributes ?
            rectAttributes.getNamedItem("fill")!.value : undefined;

        if (customColors) {
            return backgroundColor || defaultColors?.background || "white"
        }

        return defaultColors?.background || "black"
    }

    return (
        <div style={{ "overflow": "auto", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: SVGTextElement, index: number) => {
                const lineNumber = textLine.attributes.getNamedItem("data-text-line")!.value;

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
                        key={index}>{textLine.textContent} <br />
                    </span>)
            })}
        </div >
    )
}