import { useState } from "react"
import Button from "./button"

function mainpage() {

    return (
        <div className="main-page">
            <Button />
            <div className="main-content">
                <div className="chat-list">
                    <div className="chat-header">
                    </div>
                </div>

                <div className="chat-area">
                </div>
            </div>
        </div>
    )
}

export default mainpage