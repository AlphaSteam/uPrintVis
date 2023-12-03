import React from "react"

export default function LoadingMessage(props: {message: string}){
    const {message} = props;
    
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            height: "100vh",
            width: "100vw"
        }}>
            <span style={{
                alignSelf: "center"
            }}>
                {message}
            </span>
        </div>
    )

}