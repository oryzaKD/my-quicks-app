import { useState } from 'react'
import '../App.css'

interface Chat {
    id: number
    name: string
    lastMessage: string
    timestamp: string
    avatar: string
    unreadCount?: number
}

interface InboxProps {
    onClose: () => void
    isLoadingChats: boolean
}

function Inbox({ onClose, isLoadingChats }: InboxProps) {
    const chats: Chat[] = [
        {
            id: 1,
            name: "ABC",
            lastMessage: "Please check this out!",
            timestamp: "19:32",
            avatar: "A",
            unreadCount: 2
        },
    ]

    return (
        <div className="messaging">
            {/* Inbox Dialog Modal */}
            <div className="dialog-header">
                <h2 className="dialog-title">Inbox</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="dialog-body">
                <div className="search-bar-dialog">
                    <input type="text" placeholder="Search" />
                    <span className="search-icon">🔍</span>
                </div>
                {isLoadingChats ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading Chats ...</p>
                    </div>
                ) : (
                    <div className="chat-list-dialog">
                        {chats.map(chat => (
                            <div key={chat.id} className="chat-item-dialog">
                                <div className="chat-avatar">{chat.avatar}</div>
                                <div className="chat-info">
                                    <div className="chat-name">{chat.name}</div>
                                    <div className="chat-last-message">{chat.lastMessage}</div>
                                </div>
                                <div className="chat-time">{chat.timestamp}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Inbox