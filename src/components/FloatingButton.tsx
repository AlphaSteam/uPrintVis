export default function Microprint(props: { children: any; backgroundColor?: string; onClick?: any; size?: string; }) {
    const { children, backgroundColor = "black", onClick = () => null, size = "3rem" } = props
    return (
        <div style={{
            borderRadius: "999999px",
            backgroundColor,
            width: size,
            height: size,
            display: "flex",
            cursor: "pointer",
            border: "black 1px solid",
            boxShadow: "2px 2px rgba(0,0,0,0.3)"
        }}
            onClick={onClick}
        >
            <div style={{ margin: "auto" }}>
                {children}
            </div>
        </div>
    )
}