import React, {
    useMemo,
    useState, useEffect, Dispatch, SetStateAction
} from "react"
import SVG from './Svg';
import transformRectArrayIntoObject from "../helpers/transformArrayIntoObject"

export default function MicroprintSvg(props: {
    svgSource: string,
    setSvgTextLines: Dispatch<SetStateAction<SVGTextElement[]>>,
    setFontFamily: Dispatch<SetStateAction<string>>,
    setSvgRects: Dispatch<SetStateAction<SVGRectElement[]>>,
    setDefaultColors: (rects: SVGRectElement[], texts: SVGTextElement[],
        textGroup: SVGGElement) => void,
    search: {
        searchText: string;
        backgroundColor: string;
        textColor: string;
    }
}) {

    const {
        svgSource,
        setSvgTextLines,
        setFontFamily,
        setSvgRects,
        setDefaultColors,
        search
    } = props

    const [svgRef, setSvgRef] = useState<SVGElement | null>(null);

    const setScrollTo = (element: SVGElement, index: string | null) => {
        const textLine = element.attributes.getNamedItem("data-text-line")?.value || index

        element.onclick = () => {
            if (!textLine) return

            const renderedLine = document
                .getElementById(`rendered-line-${parseInt(textLine, 10)}`);

            renderedLine!.scrollIntoView({ block: "center" });
        }
    }

    const searchInTextLine = (textContent: string | null) => {
        const { searchText } = search;

        if (searchText && textContent) {
            try {
                const regex = new RegExp(searchText);

                return regex.test(textContent)
            } catch (e) {
                return textContent.includes(searchText)
            }
        }
        return false;
    }


    useEffect(() => {
        if (svgRef !== null) {
            const group: SVGGElement = Array.from(svgRef
                .getElementsByTagName("g"))[1];

            const fontFamily: string = group.attributes
                .getNamedItem("font-family")?.value || "monospace";

            setFontFamily(fontFamily)

            const texts: SVGTextElement[] = Array.from(svgRef
                .getElementsByTagName("text"));

            setSvgTextLines(texts);

            const rects: SVGRectElement[] = Array.from(svgRef
                .getElementsByTagName("rect"));

            setSvgRects(rects);

            rects.forEach((rect, index) => setScrollTo(rect, index.toString()));
            texts.forEach((text, index) => setScrollTo(text, index.toString()));

            setDefaultColors(rects, texts, group);
        }

    }, [svgRef])

    const DefaultSvg = (props: { setSvgRef: Dispatch<SetStateAction<SVGElement | null>> }) =>
        <SVG svgSource={svgSource} setSvgRef={props.setSvgRef} />

    const changeTextColor = (textLine: SVGTextElement) => {
        const { textColor: searchTextColor } = search;

        if (textLine && textLine.attributes && textLine.attributes.getNamedItem("fill")) {
            const textContent = textLine.textContent

            if (searchInTextLine(textContent)) {
                textLine.attributes.getNamedItem("fill")!.value = searchTextColor;
            }
        }
    }

    const changeBackgroundColor = (rect: SVGRectElement, textLine: SVGTextElement) => {
        const textContent = textLine.textContent

        const { backgroundColor: searchBackgroundColor } = search;

        if (searchInTextLine(textContent)) {
            rect.attributes.getNamedItem("fill")!.value = searchBackgroundColor;
        }
    }

    useEffect(() => {
        if (svgRef !== null) {
            const texts: SVGTextElement[] = Array.from(svgRef
                .getElementsByTagName("text"));


            const rects: SVGRectElement[] = Array.from(svgRef
                .getElementsByTagName("rect"));

            const parsedSvgRects = transformRectArrayIntoObject(rects)

            texts.forEach((textLine: SVGTextElement, index) => {
                changeTextColor(textLine);

                const lineNumber = textLine?.attributes?.getNamedItem("data-text-line")?.value || index.toString();

                const rect: SVGRectElement | null = parsedSvgRects && parsedSvgRects[lineNumber];

                if (!rect || !rect["attributes"]) return

                changeBackgroundColor(rect, textLine)
            })
        }
    }, [svgRef, JSON.stringify(search)])

    const MemoizedSVG = useMemo(
        () => <DefaultSvg setSvgRef={setSvgRef} />,
        [JSON.stringify(search)]
    )

    return (
        <>
            {MemoizedSVG}
        </>
    )

}