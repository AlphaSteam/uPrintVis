import { useEffect, useState, useMemo } from "react"

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

    const transformRectArrayIntoObject = (rectArray: SVGRectElement[]) => {
        const parsedObject: any = {};

        rectArray.forEach((rect: SVGRectElement) => {
            const textLine: string | undefined = rect.attributes
                .getNamedItem("data-text-line")?.value;

            if (!textLine) return;

            parsedObject[textLine] = rect;
        })
        return parsedObject;
    }

    const memoizedSvgRects = useMemo(() => svgRects, [svgRects])

    useEffect(() => {
        setParsedSvgRects(transformRectArrayIntoObject(svgRects))
    }, [memoizedSvgRects])

    return (
        <div style={{ "overflow": "auto", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: SVGTextElement, index: number) => {

                const lineNumber = textLine.attributes.getNamedItem("data-text-line")!.value;

                const textColor = textLine.attributes.getNamedItem("fill")?.value;

                const rect: SVGRectElement | null = parsedSvgRects && parsedSvgRects[lineNumber];

                if (!rect || !rect["attributes"]) return

                const rectAttributes: NamedNodeMap = rect && rect["attributes"]

                const backgroundColor = rectAttributes ?
                    rectAttributes.getNamedItem("fill").value : undefined;

                return (
                    <span
                        style={{
                            display: "block",
                            fontSize,
                            color: customColors ? textColor : defaultColors?.text || "black",
                            backgroundColor: customColors ?
                                backgroundColor : defaultColors?.background || "white",
                            fontFamily,
                        }}
                        id={`rendered-line-${lineNumber}`}
                        key={index}>{textLine.textContent} <br />
                    </span>)
            })}
        </div >

    )
}