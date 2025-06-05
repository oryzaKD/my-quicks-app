import { useState, useEffect } from 'react'
import '../App.css'

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
    const [message, setMessage] = useState('')
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [userColors, setUserColors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Function to generate a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Function to format date dynamically
    const formatDate = (dateString: string) => {
        const messageDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare just dates
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

        if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
            return 'Today';
        } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Function to group messages by date
    const groupMessagesByDate = (chats: Chat[]) => {
        const groups: { [key: string]: Chat[] } = {};

        chats.forEach(chat => {
            const date = chat.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(chat);
        });

        // Sort dates and return array of {date, messages}
        return Object.keys(groups)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map(date => ({
                date,
                messages: groups[date]
            }));
    };

    useEffect(() => {
        setIsLoading(true); // Start loading
        fetch('https://jsonplaceholder.typicode.com/comments')
            .then((response) => response.json())
            .then((data) => {
                const chatGroups = new Map();
                const newUserColors: { [key: string]: string } = {};
                const today = new Date().toISOString().split('T')[0]; // Get today's date once
                console.log(data);

                data.forEach((item: any) => {
                    if (!chatGroups.has(item.postId)) {
                        chatGroups.set(item.postId, []);
                    }
                    if (!newUserColors[item.name]) {
                        newUserColors[item.name] = getRandomColor();
                    }

                    chatGroups.get(item.postId).push({
                        id: item.id,
                        name: item.name,
                        lastMessage: item.body,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: today, // Set all API messages to today
                        avatar: item.name.charAt(0),
                        unreadCount: Math.floor(Math.random() * 10)
                    });
                });
                setUserColors(newUserColors);
                const formattedChats = Array.from(chatGroups, ([postId, chats]) => ({ postId, chats }));
                setChats(formattedChats);
            })
            .catch((error) => {
                console.error('Error fetching chats:', error);
            })
            .finally(() => {
                setIsLoading(false); // Stop loading
            });
    }, []);

    // Clear "new" flags after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setChats(prevChats =>
                prevChats.map(group => ({
                    ...group,
                    chats: group.chats.map(chat => ({
                        ...chat,
                        isNew: false
                    }))
                }))
            );
            // Also update selectedGroup if it exists
            if (selectedGroup) {
                setSelectedGroup(prevGroup => ({
                    ...prevGroup!,
                    chats: prevGroup!.chats.map(chat => ({
                        ...chat,
                        isNew: false
                    }))
                }));
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [chats, selectedGroup]);

    const sendMessage = (message: string, postId?: number) => {
        console.log('sendMessage called with:', { message, postId, selectedGroup });

        // Validate message and postId
        if (!message.trim() || !postId || isSendingMessage) {
            console.log('sendMessage validation failed:', {
                messageTrimmed: message.trim(),
                postId,
                hasMessage: !!message.trim(),
                hasPostId: !!postId,
                isSendingMessage
            });
            return;
        }

        console.log('Sending message:', message.trim());
        setIsSendingMessage(true); // Start sending state

        // Clear the message input immediately
        setMessage('');

        // Add the message to the UI immediately (optimistic update)
        const newMessage = {
            id: Date.now(), // Temporary ID
            name: 'You',
            lastMessage: message.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            avatar: 'Y',
            unreadCount: 0,
            isNew: true,
        };

        console.log('New message created:', newMessage);

        setChats((prevChats) => {
            console.log('Updating chats, prevChats:', prevChats);
            return prevChats.map(group => {
                if (group.postId === postId) {
                    const updatedGroup = {
                        ...group,
                        chats: [...group.chats, newMessage]
                    };
                    console.log('Updated group:', updatedGroup);
                    // Update selectedGroup if it's the same group
                    if (selectedGroup && selectedGroup.postId === postId) {
                        setSelectedGroup(updatedGroup);
                        console.log('Updated selectedGroup');
                    }
                    return updatedGroup;
                }
                return group;
            });
        });

        // Send to API (this will update the temporary message with real data)
        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: 'foo',
                body: message.trim(),
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => {
                console.log('Message sent:', json);
                // Update the temporary message with the real API response
                setChats((prevChats) => {
                    return prevChats.map(group => {
                        if (group.postId === postId) {
                            const updatedGroup = {
                                ...group,
                                chats: group.chats.map(chat =>
                                    chat.id === newMessage.id
                                        ? { ...chat, id: json.id }
                                        : chat
                                )
                            };
                            // Update selectedGroup if it's the same group
                            if (selectedGroup && selectedGroup.postId === postId) {
                                setSelectedGroup(updatedGroup);
                            }
                            return updatedGroup;
                        }
                        return group;
                    });
                });
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                // Optionally remove the message if API call fails
                setChats((prevChats) => {
                    return prevChats.map(group => {
                        if (group.postId === postId) {
                            const updatedGroup = {
                                ...group,
                                chats: group.chats.filter(chat => chat.id !== newMessage.id)
                            };
                            // Update selectedGroup if it's the same group
                            if (selectedGroup && selectedGroup.postId === postId) {
                                setSelectedGroup(updatedGroup);
                            }
                            return updatedGroup;
                        }
                        return group;
                    });
                });
            })
            .finally(() => {
                setIsSendingMessage(false); // Stop sending state
            });
    };

    const selectGroup = (group: ChatGroup) => {
        console.log(group);
        setSelectedGroup(group);
    };

    return (
        <div className="messaging">
            {/* Inbox Dialog Modal */}
            <div className="dialog-header">
                {selectedGroup ? (
                    <div className="header-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="back-button" onClick={() => setSelectedGroup(null)}>←</button>
                        <div style={{ marginLeft: '10px' }}>
                            <h2 style={{ color: '#2F80ED', fontSize: '15px', fontWeight: '600', margin: 0 }}>Group {selectedGroup.postId}</h2>
                            <span style={{ color: '#2F80ED', fontSize: '12px', fontWeight: '400' }}>{selectedGroup.chats.length} Participants</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="search-bar-dialog">
                            <input type="text" placeholder="Search" />
                            <span className="search-icon"><svg width="12" height="12" viewBox="0 0 32 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1856 18.9783H22.5486L31.1579 27.6047L28.5872 30.1754L19.9607 21.5662V20.2032L19.4949 19.7201C17.528 21.4109 14.9746 22.4289 12.1968 22.4289C6.00304 22.4289 0.982422 17.4082 0.982422 11.2144C0.982422 5.02061 6.00304 0 12.1968 0C18.3907 0 23.4113 5.02061 23.4113 11.2144C23.4113 13.9922 22.3934 16.5456 20.7026 18.5124L21.1856 18.9783ZM4.433 11.2145C4.433 15.5104 7.90084 18.9783 12.1968 18.9783C16.4928 18.9783 19.9607 15.5104 19.9607 11.2145C19.9607 6.91846 16.4928 3.45062 12.1968 3.45062C7.90084 3.45062 4.433 6.91846 4.433 11.2145Z" fill="#4F4F4F" />
                            </svg>
                            </span>
                        </div>
                        {/* <button className="close-button" onClick={onClose}><svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 2.115L18.885 0L10.5 8.385L2.115 0L0 2.115L8.385 10.5L0 18.885L2.115 21L10.5 12.615L18.885 21L21 18.885L12.615 10.5L21 2.115Z" fill="#4F4F4F" />
                        </svg>
                        </button> */}
                    </>
                )}
            </div>
            <div className="dialog-body">
                {selectedGroup ? (
                    <div className="chat-container">
                        <div className="chat-messages">
                            {groupMessagesByDate(selectedGroup.chats).map((dateGroup, groupIndex) => (
                                <div key={dateGroup.date}>
                                    <div className="date-separator">{formatDate(dateGroup.date)}</div>
                                    {dateGroup.messages.map((chat: Chat, index) => (
                                        <div key={chat.id}>
                                            {chat.isNew && <div className="new-message-separator">---------------------------------- New Message ----------------------------------</div>}
                                            <div
                                                className={`message-bubble ${chat.name === 'You' ? 'user' : 'other'}`}
                                            >
                                                <div className="message-name"
                                                    style={{ color: userColors[chat.name] || '#333333' }}>{chat.name}</div>
                                                <div className="message-content"
                                                    style={{ backgroundColor: userColors[chat.name] || '#333333' }}>{chat.lastMessage}
                                                    <div className="message-time">{chat.timestamp}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="message-input-area-fixed">
                            <input
                                type="text"
                                placeholder="Type a new message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage(message, selectedGroup?.postId);
                                    }
                                }}
                            />
                            <button
                                style={{
                                    backgroundColor: isSendingMessage ? '#BDBDBD' : '#2F80ED',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isSendingMessage ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    minWidth: '80px',
                                    justifyContent: 'center'
                                }}
                                onClick={() => sendMessage(message, selectedGroup?.postId)}
                                disabled={isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #ffffff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Sending...
                                    </>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="chat-list-dialog">
                        {isLoading ? (
                            <div className="loading-container" style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '50px 0',
                                flexDirection: 'column'
                            }}>
                                <div className="spinner" style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #2F80ED',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>Loading conversations...</p>
                            </div>
                        ) : (
                            chats.map((group: ChatGroup) => (
                                <div key={group.postId} className="chat-group">
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
                                            <div className="chat-name" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: 'Lato Bold, Lato, sans-serif', gap: '5px', fontSize: '16px' }}>Group {group.postId} <span style={{ color: '#828282', fontSize: '12px', fontWeight: '400' }}>{group.chats[group.chats.length - 1].timestamp}</span></div>
                                            <div style={{ color: '#828282', fontSize: '12px', fontWeight: 'bold', fontFamily: 'Lato Bold, Lato, sans-serif' }}>{group.chats[group.chats.length - 1].name} :</div>
                                            <div className="chat-last-message">{group.chats[group.chats.length - 1].lastMessage}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Inbox