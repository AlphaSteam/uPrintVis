import { parse } from "query-string";
import { useEffect, useState, useMemo } from "react"

export default function MicroprintText(props: { textLines: SVGTextElement[]; fontSize: number, svgRects: SVGRectElement[] }) {
    const { textLines, fontSize, svgRects } = props;

    const [parsedSvgRects, setParsedSvgRects] = useState(null);

    const transformRectArrayIntoObject = (rectArray: SVGRectElement[]) => {
        const parsedObject: any = {};

        rectArray.forEach((rect: SVGRectElement) => {
            const textLine: string | undefined = rect.attributes.getNamedItem("data-text-line")?.value;

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
        <div style={{ "overflow": "visible", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: SVGTextElement, index: number) => {

                const lineNumber = textLine.attributes.getNamedItem("data-text-line")!.value;

                const textColor = textLine.attributes.getNamedItem("fill")?.value;

                const rect: SVGRectElement | null = parsedSvgRects && parsedSvgRects[lineNumber];

                const rectAttributes: NamedNodeMap | null = rect && rect["attributes"]

                const backgroundColor = rectAttributes ? rectAttributes.getNamedItem("fill").value : undefined;

                return (
                    <span
                        style={{
                            display: "block",
                            fontSize,
                            color: textColor,
                            backgroundColor
                        }}
                        id={`rendered-line-${lineNumber}`}
                        key={index}>{textLine.textContent} <br />
                    </span>)
            })}
        </div>

    )
}