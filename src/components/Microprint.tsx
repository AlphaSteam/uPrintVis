import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';
import MicroprintText from "./MicroprintText";
import { useElementSize } from 'usehooks-ts'

export default function Microprint() {
    const [url, setUrl] = useState<string>("")

    const [svgTextLines, setSvgTextLines] = useState<string[]>([])

    const [divRef, { width }] = useElementSize()

    const svgRef = useRef(null)

    useEffect(() => {
        const query = queryString.parse(window.location.search, { arrayFormat: 'bracket' });
        if (query?.url) {
            setUrl(query.url)
        }
    }, [])

    return (
        <div>
            <div style={{
                position: "fixed",
                right: 0,
                display: "flex"
            }}
                ref={divRef}
            >
                <SVG innerRef={svgRef} src={url}
                    style={{
                        width: "auto",
                    }}
                    title="Microprint"
                    onLoad={(_src, _hasCache) => {
                        if (svgRef && svgRef.current) {
                            const texts = Array.from(svgRef.current.getElementsByTagName("text"))
                            const rects = Array.from(svgRef.current.getElementsByTagName("rect"))
                            console.log(rects)
                            setSvgTextLines(texts)
                        }
                    }}
                />
            </div>

            <div style={{ width: `calc(100% - ${width}px)` }}>
                <MicroprintText textLines={svgTextLines || []} />
            </div>
        </div>

    )
}