import { useState, useEffect, useRef } from 'react'
import '../App.css'
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
    const [message, setMessage] = useState('')
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [userColors, setUserColors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingMessage, setIsSendingMessage] = useState(false);(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [showNewMessageSeparator, setShowNewMessageSeparator] = useState<{ [key: number]: boolean }>({});
    const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
    const newMessageSeparatorRef = useRef<HTMLDivElement | null>(null);
    const [showFloatingNewMessage, setShowFloatingNewMessage] = useState(false);

    const currentNewMessageId = Object.keys(showNewMessageSeparator).find(
        id => showNewMessageSeparator[Number(id)]
    );

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
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.
            getDate());

        const date = new Date(today);
        const formatter = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        const formatted = formatter.format(date);

        if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
            return '━━━━━━━━━━━━ Today ' + formatted + ' ━━━━━━━━━━━━';
        } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
            return '━━━━━━━━━━━━ Yesterday ━━━━━━━━━━━━';
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
        fetch(API_ENDPOINTS.GET_COMMENTS)
            .then((response) => response.json())
            .then((data) => {
                const chatGroups = new Map();
                const newUserColors: { [key: string]: string } = {};

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
                    if (!newUserColors[message.name]) {
                        newUserColors[message.name] = getRandomColor();
                    }

                    chatGroups.get(message.postId).push({
                        id: message.id,
                        name: message.name,
                        lastMessage: message.body,
                        timestamp: time24h,
                        date: formatted,
                        avatar: message.name.charAt(0),
                        unreadCount: Math.floor(Math.random() * 5), // Random unread count between 0-4
                        isNew: true // Mark these messages as new
                    });
                });

                // Process the API messages
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
                        timestamp: time24h,
                        date: formatted,
                        avatar: item.name.charAt(0),
                        unreadCount: Math.floor(Math.random() * 10)
                    });
                });

                setUserColors(newUserColors);
                const formattedChats = Array.from(chatGroups, ([postId, chats]) => ({ postId, chats }));
                setChats(formattedChats);
                console.log('All chats:', formattedChats);
            })
            .catch((error) => {
                console.error('Error fetching chats:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Auto-scroll to bottom when selectedGroup changes or messages are added
    useEffect(() => {
        if (selectedGroup && chatMessagesContainerRef.current) {
            const container = chatMessagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [selectedGroup, selectedGroup?.chats]);

    // Effect to handle new message separators
    useEffect(() => {
        if (selectedGroup) {
            const newSeparatorState: { [key: number]: boolean } = {};
            selectedGroup.chats.forEach(chat => {
                if (chat.isNew) {
                    newSeparatorState[chat.id] = true;
                    setTimeout(() => {
                        setShowNewMessageSeparator(prev => ({
                            ...prev,
                            [chat.id]: false
                        }));
                        // Also clear isNew for this chat only
                        setChats(prevChats =>
                            prevChats.map(group =>
                                group.postId === selectedGroup.postId
                                    ? {
                                        ...group,
                                        chats: group.chats.map(c =>
                                            c.id === chat.id ? { ...c, isNew: false } : c
                                        )
                                    }
                                    : group
                            )
                        );
                    }, 8000); // 8 seconds timeout
                }
            });
            setShowNewMessageSeparator(newSeparatorState);
        }
    }, [selectedGroup]);

    useEffect(() => {
        const separator = newMessageSeparatorRef.current;
        if (!separator) {
            setShowFloatingNewMessage(false);
            return;
        }

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                // Only show floating if separator is not visible AND separator is still rendered
                if (currentNewMessageId && showNewMessageSeparator[Number(currentNewMessageId)]) {
                    setShowFloatingNewMessage(!entry.isIntersecting);
                } else {
                    setShowFloatingNewMessage(false);
                }
            },
            {
                root: chatMessagesContainerRef.current,
                threshold: 0.1,
            }
        );

        observer.observe(separator);

        return () => {
            observer.disconnect();
        };
    }, [selectedGroup, showNewMessageSeparator]);

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

        // 24 hour format
        const time24h = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        // Add the message to the UI immediately (optimistic update)
        const newMessage = {
            id: Date.now(), // Temporary ID
            name: 'You',
            lastMessage: message.trim(),
            timestamp: time24h,
            date: new Date().toISOString().split('T')[0],
            avatar: 'Y',
            unreadCount: 0,
            isNew: true,
        };

        console.log('New message created:', newMessage);

        // Only make API call for group chats
        if (new Set(selectedGroup?.chats.map(chat => chat.name)).size > 2) {
            // Update UI with new message
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
            console.log('Sending message to API');
            // Send to API (this will update the temporary message with real data)
            fetch(API_ENDPOINTS.POSTS_COMMENTS, {
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
        } else {
            console.log(new Set(selectedGroup?.chats.map(chat => chat.name)).size);
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
            // For individual chats, just show loading state for a moment
            setTimeout(() => {
                setIsSendingMessage(false);
            }, 3000);
        }
    };

    const selectGroup = (group: ChatGroup) => {
        console.log(group);
        setSelectedGroup(group);
    };

    const startEditing = (chatId: number, currentMessage: string) => {
        console.log('Starting edit for message:', chatId);
        console.log('Current message:', currentMessage);
        console.log('Previous editingMessageId:', editingMessageId);

        // Force state updates to happen synchronously
        setEditText(currentMessage);
        setEditingMessageId(chatId);
        setOpenDropdown(null);

        // Add a small delay to ensure the state updates have taken effect
        setTimeout(() => {
            console.log('States updated in startEditing');
            console.log('New editingMessageId:', chatId);
            console.log('New editText:', currentMessage);
        }, 0);
    };

    const updateMessageAPI = async (messageId: number, newMessage: string) => {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${messageId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    id: messageId,
                    title: 'Updated Message',
                    body: newMessage,
                    userId: 1,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update message');
            }

            const result = await response.json();
            console.log('Message updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    };

    const saveEdit = async (chatId: number) => {
        console.log('Saving edit for message:', chatId);
        console.log('New message text:', editText);
        if (!editText.trim()) return;

        try {
            // Call API to update the message
            await updateMessageAPI(chatId, editText.trim());

            // Update the message in the chats state only if API call succeeds
            setChats(prevChats => {
                const updatedChats = prevChats.map(group => {
                    if (group.postId === selectedGroup?.postId) {
                        const updatedGroup = {
                            ...group,
                            chats: group.chats.map(chat =>
                                chat.id === chatId
                                    ? { ...chat, lastMessage: editText.trim() }
                                    : chat
                            )
                        };
                        // Update selectedGroup if it's the same group
                        if (selectedGroup && selectedGroup.postId === group.postId) {
                            setSelectedGroup(updatedGroup);
                        }
                        return updatedGroup;
                    }
                    return group;
                });
                console.log('Updated chats:', updatedChats);
                return updatedChats;
            });

            // Reset editing state
            setEditingMessageId(null);
            setEditText('');
            console.log('Edit saved successfully');
        } catch (error) {
            console.error('Error saving edit:', error);
            alert('Failed to update message. Please try again.');
        }
    };

    const cancelEdit = () => {
        console.log('Canceling edit');
        setEditingMessageId(null);
        setEditText('');
    };

    useEffect(() => {
        console.log('Current editingMessageId:', editingMessageId);
        console.log('Current editText:', editText);
    }, [editingMessageId, editText]);

    return (
        <div className="messaging">
            {/* Inbox Dialog Modal */}
            <div className="dialog-header">
                {selectedGroup ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div className="header-container" style={{ display: 'flex', alignItems: 'center' }}>
                            <button className="back-button" onClick={() => setSelectedGroup(null)}><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.9883 13.8304H10.6868L17.7152 6.80204L15.9298 5.02924L5.87134 15.0877L15.9298 25.1462L17.7026 23.3734L10.6868 16.345H25.9883V13.8304Z" fill="black" />
                            </svg>
                            </button>
                            {new Set(selectedGroup?.chats.map(chat => chat.name)).size > 2 ? (
                                <div style={{ marginLeft: '10px' }}>
                                    <h2 style={{ color: '#2F80ED', fontSize: '16px', fontWeight: '600', margin: 0 }}>Group {selectedGroup.postId}</h2>
                                    <span style={{ color: 'black', fontSize: '12px', fontWeight: '400' }}>{new Set(selectedGroup.chats.map(chat => chat.name)).size} Participants</span>
                                </div>
                            ) : (
                                <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div>
                                        <h2 style={{ color: '#2F80ED', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                                            {selectedGroup && selectedGroup.chats[0].name}
                                        </h2>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="close-button" onClick={onClose}><svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 2.115L18.885 0L10.5 8.385L2.115 0L0 2.115L8.385 10.5L0 18.885L2.115 21L10.5 12.615L18.885 21L21 18.885L12.615 10.5L21 2.115Z" fill="black" />
                        </svg>
                        </button>
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
                    </>
                )}
            </div>
            <div className="dialog-body">
                {selectedGroup ? (
                    <div className="chat-container">
                        <div className="chat-messages" ref={chatMessagesContainerRef}>
                            {groupMessagesByDate(selectedGroup.chats).map((dateGroup) => (
                                <div key={dateGroup.date}>
                                    <div className="date-separator">{formatDate(dateGroup.date)}</div>
                                    {dateGroup.messages.map((chat: Chat) => (
                                        <div key={chat.id}>
                                            {chat.isNew && showNewMessageSeparator[Number(currentNewMessageId)] && 
                                                <div
                                                    className="new-message-separator"
                                                    ref={newMessageSeparatorRef}
                                                >
                                                    ━━━━━━━━━━━━━━━━ New Message ━━━━━━━━━━━━━━━━
                                                </div>
                                            }
                                            <div
                                                className={`message-bubble ${chat.name === 'You' ? 'user' : 'other'}`}
                                            >
                                                <div className="message-name"
                                                    style={{ color: userColors[chat.name] || '#333333' }}>{chat.name}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                                                    {chat.name === 'You' ? (
                                                        <>
                                                            <div style={{ position: 'relative' }}>
                                                                <svg
                                                                    style={{ cursor: 'pointer', flexShrink: 0, width: '21px', height: '6px' }}
                                                                    width="21" height="6" viewBox="0 0 21 6" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => {
                                                                        console.log('Dropdown clicked for chat:', chat.id);
                                                                        setOpenDropdown(openDropdown === chat.id ? null : chat.id);
                                                                    }}
                                                                >
                                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.73685 0.573059C1.35381 0.573059 0.222229 1.70464 0.222229 3.08768C0.222229 4.47072 1.35381 5.6023 2.73685 5.6023C4.11989 5.6023 5.25147 4.47072 5.25147 3.08768C5.25147 1.70464 4.11989 0.573059 2.73685 0.573059ZM17.8246 0.573059C16.4415 0.573059 15.3099 1.70464 15.3099 3.08768C15.3099 4.47072 16.4415 5.6023 17.8246 5.6023C19.2076 5.6023 20.3392 4.47072 20.3392 3.08768C20.3392 1.70464 19.2076 0.573059 17.8246 0.573059ZM7.76609 3.08768C7.76609 1.70464 8.89767 0.573059 10.2807 0.573059C11.6637 0.573059 12.7953 1.70464 12.7953 3.08768C12.7953 4.47072 11.6637 5.6023 10.2807 5.6023C8.89767 5.6023 7.76609 4.47072 7.76609 3.08768Z" fill="#4F4F4F" />
                                                                </svg>
                                                                {openDropdown === chat.id && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '20px',
                                                                        left: '0',
                                                                        backgroundColor: 'white',
                                                                        border: '1px solid #E0E0E0',
                                                                        borderRadius: '8px',
                                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                                        zIndex: 1000,
                                                                        minWidth: '120px'
                                                                    }}>
                                                                        <div
                                                                            style={{
                                                                                padding: '12px 16px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                color: '#2F80ED',
                                                                                borderBottom: '1px solid #F0F0F0'
                                                                            }}
                                                                            onMouseDown={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                console.log('Edit button clicked');
                                                                                console.log('Chat ID:', chat.id);
                                                                                console.log('Message:', chat.lastMessage);
                                                                                startEditing(chat.id, chat.lastMessage);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                padding: '12px 16px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                color: '#EB5757'
                                                                            }}
                                                                            onClick={() => {
                                                                                console.log('Delete message:', chat.id);
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {(() => {
                                                                // console.log('Rendering message for chat:', chat.id);
                                                                // console.log('Current editingMessageId:', editingMessageId);
                                                                // console.log('Is editing this message?', editingMessageId === chat.id);

                                                                return editingMessageId === chat.id ? (
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '8px',
                                                                        backgroundColor: '#ffffff',
                                                                        padding: '12px',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid #e0e0e0',
                                                                        minWidth: '300px',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                        position: 'relative',
                                                                        zIndex: 1000
                                                                    }}>
                                                                        <input
                                                                            type="text"
                                                                            value={editText}
                                                                            onChange={(e) => setEditText(e.target.value)}
                                                                            style={{
                                                                                border: '1px solid #ddd',
                                                                                borderRadius: '8px',
                                                                                padding: '8px 12px',
                                                                                fontSize: '14px',
                                                                                outline: 'none',
                                                                                backgroundColor: 'white',
                                                                                color: 'black',
                                                                                width: '100%'
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    saveEdit(chat.id);
                                                                                } else if (e.key === 'Escape') {
                                                                                    e.preventDefault();
                                                                                    cancelEdit();
                                                                                }
                                                                            }}
                                                                            autoFocus
                                                                        />
                                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                            <button
                                                                                onClick={cancelEdit}
                                                                                style={{
                                                                                    backgroundColor: '#f0f0f0',
                                                                                    color: '#666',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    padding: '6px 12px',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => saveEdit(chat.id)}
                                                                                style={{
                                                                                    backgroundColor: '#2F80ED',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    padding: '6px 12px',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="message-content"
                                                                        style={{ backgroundColor: userColors[chat.name] || '#333333' }}>{chat.lastMessage}
                                                                        <div className="message-time">{chat.timestamp}</div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="message-content"
                                                                style={{ backgroundColor: userColors[chat.name] || '#333333' }}>{chat.lastMessage}
                                                                <div className="message-time">{chat.timestamp}</div>
                                                            </div>
                                                            <div style={{ position: 'relative' }}>
                                                                <svg
                                                                    style={{ cursor: 'pointer', flexShrink: 0, width: '21px', height: '6px' }}
                                                                    width="21" height="6" viewBox="0 0 21 6" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                                    onClick={() => {
                                                                        console.log('Dropdown clicked for chat:', chat.id);
                                                                        setOpenDropdown(openDropdown === chat.id ? null : chat.id);
                                                                    }}
                                                                >
                                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.73685 0.573059C1.35381 0.573059 0.222229 1.70464 0.222229 3.08768C0.222229 4.47072 1.35381 5.6023 2.73685 5.6023C4.11989 5.6023 5.25147 4.47072 5.25147 3.08768C5.25147 1.70464 4.11989 0.573059 2.73685 0.573059ZM17.8246 0.573059C16.4415 0.573059 15.3099 1.70464 15.3099 3.08768C15.3099 4.47072 16.4415 5.6023 17.8246 5.6023C19.2076 5.6023 20.3392 4.47072 20.3392 3.08768C20.3392 1.70464 19.2076 0.573059 17.8246 0.573059ZM7.76609 3.08768C7.76609 1.70464 8.89767 0.573059 10.2807 0.573059C11.6637 0.573059 12.7953 1.70464 12.7953 3.08768C12.7953 4.47072 11.6637 5.6023 10.2807 5.6023C8.89767 5.6023 7.76609 4.47072 7.76609 3.08768Z" fill="#4F4F4F" />
                                                                </svg>
                                                                {openDropdown === chat.id && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '20px',
                                                                        right: '0',
                                                                        backgroundColor: 'white',
                                                                        border: '1px solid #E0E0E0',
                                                                        borderRadius: '8px',
                                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                                        zIndex: 1000,
                                                                        minWidth: '120px'
                                                                    }}>
                                                                        <div
                                                                            style={{
                                                                                padding: '12px 16px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                color: '#2F80ED',
                                                                                borderBottom: '1px solid #F0F0F0'
                                                                            }}
                                                                            onClick={() => {
                                                                                console.log('Share message:', chat.id);
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                        >
                                                                            Share
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                padding: '12px 16px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                color: '#2F80ED'
                                                                            }}
                                                                            onClick={() => {
                                                                                console.log('Reply message:', chat.id);
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                        >
                                                                            Reply
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="message-input-area-fixed" style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '10px',
                            backgroundColor: 'white',
                            display: 'flex',
                            zIndex: 1000
                        }}>
                            {selectedGroup && new Set(selectedGroup?.chats.map(chat => chat.name)).size === 2 ? (
                                // Individual chat sending UI
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        backgroundColor: '#E9F3FF',
                                        borderRadius: '10px',
                                        padding: '15px',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            border: '2px solid #2F80ED',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        <span style={{
                                            color: '#4F4F4F',
                                            fontSize: '14px',
                                            flex: 1
                                        }}>
                                            Please wait while we connect you with one of our team...
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        gap: '10px'
                                    }}>
                                    <input
                                        type="text"
                                        placeholder="Type a new message"
                                        value={message}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: '1px solid #BDBDBD',
                                            outline: 'none',
                                            fontSize: '14px',
                                            borderRadius: '10px',
                                            padding: '10px',
                                            backgroundColor: '#F2F2F2',
                                            color: '#333333',
                                        }}
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
                                            minWidth: '50px',
                                            justifyContent: 'center',
                                            border: 'none',
                                            padding: '10px 20px'
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
                                // Regular message input UI
                                <>
                                    <input
                                        type="text"
                                        placeholder="Type a new message"
                                        value={message}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: '1px solid #BDBDBD',
                                            outline: 'none',
                                            fontSize: '14px',
                                            borderRadius: '10px',
                                            padding: '10px',
                                            backgroundColor: '#F2F2F2',
                                            color: '#333333',
                                        }}
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
                                            justifyContent: 'center',
                                            border: 'none',
                                            padding: '10px 20px'
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
                                </>
                            )}
                        </div>
                        {showFloatingNewMessage && currentNewMessageId && showNewMessageSeparator[Number(currentNewMessageId)] && (
                            <div
                                style={{
                                    position: 'fixed',
                                    bottom: 80,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#E9F3FF',
                                    color: '#2F80ED',
                                    borderRadius: '10px',
                                    padding: '10px 24px',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    cursor: 'pointer',
                                    zIndex: 2000,
                                    fontSize: '14px',
                                    fontFamily: 'Lato Regular',
                                }}
                                onClick={() => {
                                    newMessageSeparatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                            >
                                New Message
                            </div>
                        )}
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
                                <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>Loading Chats ...</p>
                            </div>
                        ) : (
                            chats.map((group: ChatGroup) => (
                                <div key={group.postId}>
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
                                        <div className="chat-item-dialog"
                                            onClick={() => selectGroup(group)}
                                            style={{
                                                padding: '10px 20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #E0E0E0'
                                            }}>
                                            <button
                                                className="avatar-button"
                                                style={{
                                                    width: '55px',
                                                    height: '55px',
                                                    borderRadius: '50%',
                                                    backgroundColor: userColors[group.chats[0].name] || '#2F80ED',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    marginRight: '10px'
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
                                    )}
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