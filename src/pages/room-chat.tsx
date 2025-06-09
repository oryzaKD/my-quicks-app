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

interface RoomChatProps {
    onBack: () => void;   // for back button
    onClose: () => void;  // for close button
    selectedGroup: ChatGroup;
    setSelectedGroup: (group: ChatGroup | null) => void;
}

function RoomChat({ onBack, onClose, selectedGroup, setSelectedGroup }: RoomChatProps) {
    const [message, setMessage] = useState('')
    const [userColors, setUserColors] = useState<{ [key: string]: string }>({});
    const [isSendingMessage, setIsSendingMessage] = useState(false); (false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [showNewMessageSeparator, setShowNewMessageSeparator] = useState<{ [key: number]: boolean }>({});
    const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
    const newMessageSeparatorRef = useRef<HTMLDivElement | null>(null);
    const [showFloatingNewMessage, setShowFloatingNewMessage] = useState(false);
    const selectedGroupRef = useRef<ChatGroup | null>(selectedGroup);
    const dateSeparatorRefs = useRef<{ [date: string]: HTMLDivElement | null }>({});
    const [stickyDate, setStickyDate] = useState<string | null>(null);
    const [firstVisibleDate, setFirstVisibleDate] = useState<string | null>(null);

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
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        // Reset time to compare just dates
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

        // Format for today
        const todayFormatted = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(today);

        // Format for yesterday
        const yesterdayFormatted = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(yesterday);

        if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
            return '━━━━━━━━━━━━ Today ' + todayFormatted + ' ━━━━━━━━━━━━';
        } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
            return '━━━━━━━━━━━━ Yesterday ' + yesterdayFormatted + ' ━━━━━━━━━━━━';
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
                }
            });
            console.log('Setting showNewMessageSeparator:', newSeparatorState);
            setShowNewMessageSeparator(prev => ({
                ...prev,
                ...newSeparatorState
            }));
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

    useEffect(() => {
        if (!selectedGroup) return;
        setUserColors(prevColors => {
            const newColors = { ...prevColors };
            selectedGroup.chats.forEach(chat => {
                if (chat.name !== "You" && !newColors[chat.name]) {
                    newColors[chat.name] = getRandomColor();
                }
            });
            return newColors;
        });
    }, [selectedGroup]);

    useEffect(() => {
        selectedGroupRef.current = selectedGroup;
    }, [selectedGroup]);

    useEffect(() => {
        const observer = new window.IntersectionObserver(
            (entries) => {
                // Find the last date separator that is above the top of the container (not visible)
                const visibleDates = entries
                    .filter(entry => entry.isIntersecting)
                    .map(entry => entry.target.getAttribute('data-date'));

                // If none are visible, use the last one that was scrolled past
                if (visibleDates.length > 0) {
                    setStickyDate(visibleDates[0]);
                } else {
                    // Find the last date separator above the viewport
                    const above = entries
                        .filter(entry => entry.boundingClientRect.top < 0)
                        .map(entry => entry.target.getAttribute('data-date'));
                    if (above.length > 0) {
                        setStickyDate(above[above.length - 1]);
                    }
                }
            },
            {
                root: chatMessagesContainerRef.current,
                threshold: 0,
            }
        );

        const refs = Object.values(dateSeparatorRefs.current);
        refs.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            refs.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
            observer.disconnect();
        };
    }, [selectedGroup]);

    useEffect(() => {
        const observer = new window.IntersectionObserver(
            (entries) => {
                // Find the first date separator that is visible
                const visible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) {
                    setFirstVisibleDate(visible[0].target.getAttribute('data-date'));
                } else {
                    setFirstVisibleDate(null);
                }
            },
            {
                root: chatMessagesContainerRef.current,
                threshold: 0,
            }
        );

        const refs = Object.values(dateSeparatorRefs.current);
        refs.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            refs.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
            observer.disconnect();
        };
    }, [selectedGroup]);

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
            timestamp: time24h, // current time
            date: new Date().toISOString().split('T')[0], // current date (today)
            avatar: 'Y',
            unreadCount: 0,
            isNew: true,
        };

        // Optimistically update selectedGroup with the new message
        const updatedGroup = {
            ...selectedGroup,
            chats: [...selectedGroup.chats, newMessage]
        };
        setSelectedGroup(updatedGroup);

        // Set a timeout to update isNew to false
        setTimeout(() => {
            const group = selectedGroupRef.current;
            if (!group) return;
            setSelectedGroup({
                ...group,
                chats: group.chats.map(chat =>
                    chat.id === newMessage.id
                        ? { ...chat, isNew: false }
                        : chat
                )
            });
        }, 5000);

        // Only make API call for group chats
        if (new Set(selectedGroup?.chats.map(chat => chat.name)).size > 2) {
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
                    // Remove the temporary message and add the real message from the API
                    const filteredChats = selectedGroup.chats.filter((chat: Chat) => chat.id !== newMessage.id);
                    const realMessage = {
                        ...json,
                        name: 'You',
                        avatar: 'Y',
                        timestamp: newMessage.timestamp,
                        date: newMessage.date,
                        isNew: true,
                        lastMessage: message.trim()
                    };
                    const updatedGroup = {
                        ...selectedGroup,
                        chats: [...filteredChats, realMessage]
                    };
                    setSelectedGroup(updatedGroup);

                    // Set timeout to update isNew to false for the real message
                    setTimeout(() => {
                        if (!selectedGroupRef.current) return;
                        setSelectedGroup({
                            ...selectedGroupRef.current,
                            chats: selectedGroupRef.current.chats.map(chat =>
                                chat.id === realMessage.id
                                    ? { ...chat, isNew: false }
                                    : chat
                            )
                        });
                    }, 2000);

                    // Update showNewMessageSeparator to use the new ID
                    setShowNewMessageSeparator(prev => {
                        const newState = { ...prev };
                        delete newState[realMessage.id];
                        newState[json.id] = true;
                        return newState;
                    });
                })
                .catch((error) => {
                    console.error('Error sending message:', error);
                    // Optionally remove the message if API call fails
                    const updatedGroup = {
                        ...selectedGroup,
                        chats: selectedGroup.chats.filter((chat: Chat) => chat.id !== newMessage.id)
                    };
                    setSelectedGroup(updatedGroup);
                })
                .finally(() => {
                    setIsSendingMessage(false); // Stop sending state
                });
        } else {
            // For individual chats, just show loading state for a moment
            setTimeout(() => {
                setIsSendingMessage(false);
            }, 3000);
        }
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
            const updatedGroup = {
                ...selectedGroup,
                chats: selectedGroup.chats.map(chat =>
                    chat.id === chatId
                        ? { ...chat, lastMessage: editText.trim() }
                        : chat
                )
            };
            setSelectedGroup(updatedGroup);

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
        <div className="room-chat">
            {/* Room Chat Dialog Modal */}
            {selectedGroup && (
                <div>
                    <div className="dialog-header-chat-list">
                        <div className="header-container" style={{ display: 'flex', alignItems: 'center' }}>
                            <button className="back-button" onClick={onBack}><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.9883 13.8304H10.6868L17.7152 6.80204L15.9298 5.02924L5.87134 15.0877L15.9298 25.1462L17.7026 23.3734L10.6868 16.345H25.9883V13.8304Z" fill="black" />
                            </svg>
                            </button>
                            {new Set(selectedGroup?.chats.map(chat => chat.name)).size > 2 ? (
                                <div style={{ marginLeft: '10px' }}>
                                    <h2 style={{ color: '#2F80ED', fontSize: '16px', fontWeight: '600', margin: 0 }}>Group {selectedGroup.postId}</h2>
                                    <span style={{ color: 'black', fontSize: '12px', fontWeight: '400' }}>{new Set(selectedGroup.chats.map(chat => chat.name)).size} Participants</span>
                                </div>
                            ) : (
                                <div style={{ marginLeft: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <div className="dialog-body" style={{ height: 540, overflowY: 'auto' }}>
                        <div className="chat-container">
                            <div className="chat-messages" ref={chatMessagesContainerRef}>
                                {/* Only show sticky separator if it's not the same as the first visible in-list separator */}
                                {stickyDate && stickyDate !== firstVisibleDate && (
                                    <div
                                        className="date-separator sticky"
                                        style={{
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 100,
                                            background: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {formatDate(stickyDate)}
                                    </div>
                                )}
                                {groupMessagesByDate(selectedGroup.chats).map((dateGroup) => (
                                    <div key={dateGroup.date}>
                                        {/* Only show in-list separator at the start of each date group */}
                                        <div
                                            className="date-separator"
                                            ref={el => { if (el) dateSeparatorRefs.current[dateGroup.date] = el; }}
                                            data-date={dateGroup.date}
                                        >
                                            {formatDate(dateGroup.date)}
                                        </div>
                                        {dateGroup.messages.map((chat: Chat) => (
                                            <div key={chat.id}>
                                                {chat.isNew && showNewMessageSeparator[chat.id] && (
                                                    <div
                                                        className="new-message-separator"
                                                        ref={newMessageSeparatorRef}
                                                    >
                                                        ━━━━━━━━━━━━━━ New Message ━━━━━━━━━━━━━━
                                                    </div>
                                                )}
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
                                                                                    borderBottom: '1px solid black'
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
                                                                                    borderBottom: '1px solid black'
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
                    </div>
                </div>
            )}
        </div>
    )
}

export default RoomChat