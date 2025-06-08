import { useState, useEffect, useRef } from 'react'
import '../App.css'
import RoomChat from './room-chat'
import { API_ENDPOINTS } from '../helpers/endpoint'

interface Chat {
    id: number
    name: string
    lastMessage: string
    timestamp: string
    date: string
    avatar: string
    unreadCount?: number
    isNew?: boolean
}

interface ChatGroup {
    postId: number;
    chats: Chat[];
}

interface InboxProps {
    onClose: () => void
}

function Inbox({ onClose }: InboxProps) {
    const [chats, setChats] = useState<ChatGroup[]>([])
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setIsLoading(true); // Start loading
        fetch(API_ENDPOINTS.GET_COMMENTS)
            .then((response) => response.json())
            .then((data) => {
                const chatGroups = new Map();

                // 24 hour format
                const time24h = new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });

                const today = new Date().toISOString().split('T')[0];
                const date = new Date(today);
                const formatter = new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
                const formatted = formatter.format(date);

                // Example individual messages to add
                const individualMessages = [
                    {
                        id: 999,
                        name: "Cameron Phillips",
                        body: "Please check the latest design updates! 👨‍💻",
                        timestamp: time24h,
                        date: formatted,
                        postId: 1001 // unique group ID
                    },
                    {
                        id: 996,
                        name: "FastVisa Support",
                        body: "Hey there...",
                        timestamp: time24h,
                        date: formatted,
                        postId: 1004
                    }
                ];

                // Add individual messages first
                individualMessages.forEach(message => {
                    if (!chatGroups.has(message.postId)) {
                        chatGroups.set(message.postId, []);
                    }

                    chatGroups.get(message.postId).push({
                        id: message.id,
                        name: message.name,
                        lastMessage: message.body,
                        timestamp: time24h,
                        date: formatted,
                        avatar: message.name.charAt(0),
                        unreadCount: Math.floor(Math.random() * 5), // Random unread count between 0-4
                        isNew: false // Mark these messages as new
                    });
                });

                // Process the API messages
                data.forEach((item: any) => {
                    if (!chatGroups.has(item.postId)) {
                        chatGroups.set(item.postId, []);
                    }

                    chatGroups.get(item.postId).push({
                        id: item.id,
                        name: item.name,
                        lastMessage: item.body,
                        timestamp: time24h,
                        date: formatted,
                        avatar: item.name.charAt(0),
                        unreadCount: Math.floor(Math.random() * 10)
                    });
                });

                const formattedChats = Array.from(chatGroups, ([postId, chats]) => ({ postId, chats }));
                setChats(formattedChats);
                console.log('All chats:', formattedChats);
            })
            .catch((error) => {
                console.error('Error fetching chats:', error);
            })
            .finally(() => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 3000);
            });
    }, []);

    // Auto-scroll to bottom when selectedGroup changes or messages are added
    useEffect(() => {
        if (selectedGroup && chatMessagesContainerRef.current) {
            const container = chatMessagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [selectedGroup, selectedGroup?.chats]);

    const selectGroup = (group: ChatGroup) => {
        console.log(group);
        setSelectedGroup(group);
    };

    const handleUpdateSelectedGroup = (updatedGroup: ChatGroup | null) => {
        if (!updatedGroup) {
            setSelectedGroup(null);
            return;
        }
        setChats(prevChats =>
            prevChats.map(group =>
                group.postId === updatedGroup.postId ? updatedGroup : group
            )
        );
        setSelectedGroup(updatedGroup);
    };

    return (
        <div className="messaging" style={{ margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', paddingLeft: 30, paddingTop: 0, paddingRight: 30 }}>
            {/* Inbox Dialog Modal */}
            {selectedGroup ? (
                <RoomChat
                    onBack={() => setSelectedGroup(null)}
                    onClose={onClose}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={handleUpdateSelectedGroup}
                />
            ) : (
                <>
                    <div className="dialog-header">
                        <div className="search-bar-dialog">
                            <input type="text" placeholder="Search" />
                            <span className="search-icon"><svg width="12" height="12" viewBox="0 0 32 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1856 18.9783H22.5486L31.1579 27.6047L28.5872 30.1754L19.9607 21.5662V20.2032L19.4949 19.7201C17.528 21.4109 14.9746 22.4289 12.1968 22.4289C6.00304 22.4289 0.982422 17.4082 0.982422 11.2144C0.982422 5.02061 6.00304 0 12.1968 0C18.3907 0 23.4113 5.02061 23.4113 11.2144C23.4113 13.9922 22.3934 16.5456 20.7026 18.5124L21.1856 18.9783ZM4.433 11.2145C4.433 15.5104 7.90084 18.9783 12.1968 18.9783C16.4928 18.9783 19.9607 15.5104 19.9607 11.2145C19.9607 6.91846 16.4928 3.45062 12.1968 3.45062C7.90084 3.45062 4.433 6.91846 4.433 11.2145Z" fill="#4F4F4F" />
                            </svg>
                            </span>
                        </div>
                    </div>
                    <div className="dialog-body">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading Chats ...</p>
                            </div>
                        ) : (
                            chats.map((group: ChatGroup) => (
                                <div className="chat-list-dialog" key={group.postId}>
                                    {group.chats && group.chats.length > 1 ? (
                                        // Show full chat group layout for grouped messages
                                        <div className="chat-group">
                                            <div className="chat-item-dialog" onClick={() => selectGroup(group)}>
                                                <div className="tucked-avatar">
                                                    <button className="tucked-ava back-ava" tabIndex={-1} aria-hidden="true">
                                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1755 0.0292358C7.39687 0.0292358 5.14629 2.27982 5.14629 5.05848C5.14629 7.83713 7.39687 10.0877 10.1755 10.0877C12.9542 10.0877 15.2048 7.83713 15.2048 5.05848C15.2048 2.27982 12.9542 0.0292358 10.1755 0.0292358ZM12.6901 5.0585C12.6901 3.67546 11.5585 2.54388 10.1755 2.54388C8.79244 2.54388 7.66086 3.67546 7.66086 5.0585C7.66086 6.44154 8.79244 7.57312 10.1755 7.57312C11.5585 7.57312 12.6901 6.44154 12.6901 5.0585ZM17.7193 17.6316C17.4678 16.7389 13.5702 15.117 10.1754 15.117C6.79327 15.117 2.92076 16.7263 2.63158 17.6316H17.7193ZM0.117004 17.6316C0.117004 14.2871 6.81847 12.6023 10.1755 12.6023C13.5325 12.6023 20.234 14.2871 20.234 17.6316V20.1462H0.117004V17.6316Z" fill="black" />
                                                        </svg>
                                                    </button>
                                                    <button className="tucked-ava front-ava" style={{ backgroundColor: '#2F80ED' }}>
                                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1755 0.0292358C7.39687 0.0292358 5.14629 2.27982 5.14629 5.05848C5.14629 7.83713 7.39687 10.0877 10.1755 10.0877C12.9542 10.0877 15.2048 7.83713 15.2048 5.05848C15.2048 2.27982 12.9542 0.0292358 10.1755 0.0292358ZM12.6901 5.0585C12.6901 3.67546 11.5585 2.54388 10.1755 2.54388C8.79244 2.54388 7.66086 3.67546 7.66086 5.0585C7.66086 6.44154 8.79244 7.57312 10.1755 7.57312C11.5585 7.57312 12.6901 6.44154 12.6901 5.0585ZM17.7193 17.6316C17.4678 16.7389 13.5702 15.117 10.1754 15.117C6.79327 15.117 2.92076 16.7263 2.63158 17.6316H17.7193ZM0.117004 17.6316C0.117004 14.2871 6.81847 12.6023 10.1755 12.6023C13.5325 12.6023 20.234 14.2871 20.234 17.6316V20.1462H0.117004V17.6316Z" fill="white" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="chat-info">
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '30px' }}>
                                                        <div className="chat-name" style={{ fontWeight: 'bold', fontFamily: 'Lato Bold', fontSize: '16px' }}>Group {group.postId} </div>
                                                        <span style={{ color: 'black', fontSize: '14px', fontFamily: 'Lato', marginTop: '2px' }}>{group.chats[group.chats.length - 1].date} {group.chats[group.chats.length - 1].timestamp}</span>
                                                    </div>
                                                    <div style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Lato Bold' }}>{group.chats[group.chats.length - 1].name} :</div>
                                                    <div style={{ color: 'black', fontSize: '14px', fontFamily: 'Lato' }} className="chat-last-message">{group.chats[group.chats.length - 1].lastMessage}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show simple avatar button for ungrouped messages
                                        <div className="chat-group">
                                            <div className="chat-item-dialog"
                                                onClick={() => selectGroup(group)}>
                                                <button
                                                    className="avatar-button"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#2F80ED',
                                                        color: 'white',
                                                        border: 'none',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        marginRight: '33px'
                                                    }}>
                                                    {group.chats[0].name.charAt(0)}
                                                </button>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '30px'
                                                    }}>
                                                        <span style={{
                                                            fontWeight: 'bold', fontFamily: 'Lato Bold', fontSize: '16px', color: '#2F80ED'
                                                        }}>{group.chats[0].name}</span>
                                                        <span style={{
                                                            color: 'black', fontSize: '14px', fontFamily: 'Lato', marginTop: '2px'
                                                        }}>{group.chats[group.chats.length - 1].date} {group.chats[0].timestamp}</span>
                                                    </div>
                                                    <div style={{
                                                        color: 'black',
                                                        fontSize: '14px',
                                                        fontFamily: 'Lato'
                                                    }}>{group.chats[0].lastMessage}</div>
                                                </div>
                                                {group.chats[0].unreadCount && group.chats[0].unreadCount > 0 && (
                                                    <div style={{
                                                        backgroundColor: '#EB5757',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '10px',
                                                        height: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px'
                                                    }}>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Inbox