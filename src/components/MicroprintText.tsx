
export default function MicroprintText(props: { textLines: any; }) {
    const { textLines } = props;


    return (
        <div style={{ "overflow": "visible", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: { textContent: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }, index: number) => {
                return (
                    <span
                        key={index}>{textLine.textContent} <br />
                    </span>)
            })}
        </div>

    )
}