import '../App.css'
import { useState, useRef, useEffect } from 'react'
import Dropdown from '../components/Dropdown';
import DateInput from '../components/DateInput';
import Checkbox from '../components/Checkbox';
import CustomDropdown from '../components/CustomDropdown';

interface TaskItem {
    id: number
    title: string
    description: string
    dueDate: string
    daysLeft: number
    completed: boolean
    dateCompleted?: string
    isEditing?: boolean
}

interface TaskProps {
    onClose: () => void
    isLoadingTask: boolean
}

const options = [
    { label: 'Personal Errands', value: 'personal' },
    { label: 'Urgent To-Do', value: 'urgent' },
];

function Task({ onClose, isLoadingTask }: TaskProps) {
    const [selected, setSelected] = useState('');
    const [date, setDate] = useState('');
    const [agree, setAgree] = useState(false);
    const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);
    const [editingDescriptionId, setEditingDescriptionId] = useState<number | null>(null);
    const [editingDescriptionValue, setEditingDescriptionValue] = useState('');
    const [dropdownTaskId, setDropdownTaskId] = useState<number | null>(null);

    const [tasks, setTasks] = useState<TaskItem[]>([
        {
            id: 1,
            title: 'Close off Case #012920- RODRIGUES, Amiguel',
            description: 'Closing off this case since this application has been cancelled. No one really understand how this case could possibly be cancelled. The options and the documents within this document were totally a guaranteed for a success!',
            dueDate: '2025-06-28',
            daysLeft: 2,
            completed: false
        },
        {
            id: 2,
            title: 'Set up documentation report for several Cases : Case 145443, Case 192829 and Case 182203',
            description: 'All Cases must include all payment transactions, all documents and forms filled. All conversations in comments and messages in channels and emails should be provided as well in.',
            dueDate: '2025-06-28',
            daysLeft: 4,
            completed: false
        },
        {
            id: 3,
            title: 'Set up appointment with Dr Blake',
            description: '',
            dueDate: '2025-06-28',
            daysLeft: 10,
            completed: false
        },
    ])

    const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([
        {
            id: 4,
            title: 'Contact Mr Caleb – video conference?',
            description: '',
            dueDate: '2025-06-28',
            daysLeft: 0,
            completed: true,
            dateCompleted: '3/06/2021'
        },
        {
            id: 5,
            title: 'Assign 3 homework to Client A',
            description: '',
            dueDate: '2025-06-28',
            daysLeft: 0,
            completed: true,
            dateCompleted: '2/06/2021'
        },
    ])

    const getDaysLeftColor = (days: number) => {
        if (days <= 2) return '#EB5757'; // red
        if (days <= 4) return '#F2994A'; // orange
        return '#2F80ED'; // blue
    }

    const handleCheck = (id: number, completed: boolean) => {
        if (!completed) {
            // Mark as complete
            const task = tasks.find(t => t.id === id)
            if (task) {
                setTasks(tasks.filter(t => t.id !== id))
                setCompletedTasks([...completedTasks, { ...task, completed: true, dateCompleted: task.dueDate }])
            }
        } else {
            // Mark as uncomplete
            const task = completedTasks.find(t => t.id === id)
            if (task) {
                setCompletedTasks(completedTasks.filter(t => t.id !== id))
                setTasks([{ ...task, completed: false, dateCompleted: undefined }, ...tasks])
            }
        }
    }

    const handleAddTask = () => {
        const newTask: TaskItem & { isEditing?: boolean } = {
            id: Date.now(),
            title: '',
            description: '',
            dueDate: '',
            daysLeft: 7,
            completed: false,
            isEditing: true,
        };
        setTasks([...tasks, newTask]);
    };

    const handleDeleteTask = (id: number, completed: boolean) => {
        if (completed) {
            setCompletedTasks(completedTasks.filter(t => t.id !== id));
        } else {
            setTasks(tasks.filter(t => t.id !== id));
        }
        setDropdownTaskId(null);
    };

    return (
        <div className="task" style={{ margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', paddingLeft: 30, paddingTop: 0, paddingRight: 30 }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16, marginTop: 0, borderBottom: '1px solid white' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' }}>
                    <Dropdown options={options} value={selected} onChange={setSelected} label="My Tasks" />
                </div>
                <button
                    style={{
                        backgroundColor: '#2F80ED',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        width: '120px',
                        height: '40px',
                        justifyContent: 'flex-end',
                        display: 'flex',
                        alignItems: 'center',
                        border: 'none',
                        padding: '10px 20px'
                    }}
                    onClick={handleAddTask}
                >New Task</button>
            </div>
            <div className="dialog-body" style={{ height: 540, overflowY: 'auto' }}>
                {isLoadingTask ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading Task List ...</p>
                    </div>
                ) : (
                    <div>
                        {/* Active Tasks */}
                        {tasks.map((task, idx) => (
                            <div key={task.id}>
                                {task.isEditing ? (
                                    <>
                                        <div style={{ borderBottom: '1px solid black', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Checkbox
                                                    checked={task.completed}
                                                    onChange={() => handleCheck(task.id, task.completed)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Type Task Title"
                                                    value={task.title}
                                                    onChange={e => {
                                                        const updated = [...tasks];
                                                        updated[idx].title = e.target.value;
                                                        setTasks(updated);
                                                    }}
                                                    onBlur={() => {
                                                        if (task.title.trim()) {
                                                            const updated = [...tasks];
                                                            updated[idx].isEditing = false;
                                                            setTasks(updated);
                                                        }
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && task.title.trim()) {
                                                            const updated = [...tasks];
                                                            updated[idx].isEditing = false;
                                                            setTasks(updated);
                                                        }
                                                    }}
                                                    style={{ width: '325px', fontSize: 14, marginBottom: 8, backgroundColor: 'white', color: 'black', borderRadius: 5, padding: 7, border: '1px solid black' }}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 'auto', gap: 8 }}>
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1.175 7.0875L5 3.27084L8.825 7.0875L10 5.9125L5 0.912503L-1.02722e-07 5.9125L1.175 7.0875Z" fill="#4F4F4F" />
                                                    </svg>
                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                        <svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setDropdownTaskId(task.id === dropdownTaskId ? null : task.id);
                                                            }}
                                                        >
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.5 1.75C10.5 2.7125 11.2875 3.5 12.25 3.5C13.2125 3.5 14 2.7125 14 1.75C14 0.7875 13.2125 -3.44227e-08 12.25 -7.64949e-08C11.2875 -1.18567e-07 10.5 0.7875 10.5 1.75ZM8.75 1.75C8.75 0.7875 7.9625 -2.63908e-07 7 -3.0598e-07C6.0375 -3.48052e-07 5.25 0.7875 5.25 1.75C5.25 2.7125 6.0375 3.5 7 3.5C7.9625 3.5 8.75 2.7125 8.75 1.75ZM1.75 -5.35465e-07C2.7125 -4.93392e-07 3.5 0.7875 3.5 1.75C3.5 2.7125 2.7125 3.5 1.75 3.5C0.7875 3.5 -1.18567e-07 2.7125 -7.64949e-08 1.75C-3.44227e-08 0.787499 0.7875 -5.77537e-07 1.75 -5.35465e-07Z" fill="#828282" />
                                                        </svg>
                                                        {dropdownTaskId === task.id && (
                                                            <div style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px #0002', zIndex: 10, transform: 'translateX(-90%)', top: 22 }}>
                                                                <div
                                                                    style={{ padding: '8px 16px', cursor: 'pointer', color: 'red', whiteSpace: 'nowrap' }}
                                                                    onClick={() => handleDeleteTask(task.id, task.completed)}
                                                                >
                                                                    Delete
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 35 }}>
                                                <span style={{ color: 'white', fontSize: 14, marginRight: 10 }}><svg width="17" height="17" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.2508 2.51465C8.31048 2.51465 2.69031 8.1474 2.69031 15.0877C2.69031 22.0281 8.31048 27.6608 15.2508 27.6608C22.2038 27.6608 27.8365 22.0281 27.8365 15.0877C27.8365 8.1474 22.2038 2.51465 15.2508 2.51465ZM15.2637 25.1462C9.70636 25.1462 5.20519 20.6451 5.20519 15.0878C5.20519 9.53045 9.70636 5.02928 15.2637 5.02928C20.821 5.02928 25.3221 9.53045 25.3221 15.0878C25.3221 20.6451 20.821 25.1462 15.2637 25.1462ZM14.0061 8.80121H15.8921V15.4021L21.55 18.7591L20.607 20.3056L14.0061 16.3451V8.80121Z" fill="#2F80ED" />
                                                </svg>
                                                </span>
                                                <DateInput
                                                    value={task.dueDate}
                                                    onChange={date => {
                                                        const updated = [...tasks];
                                                        updated[idx].dueDate = date;
                                                        setTasks(updated);
                                                    }}
                                                    label=""
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginLeft: 35 }}>
                                                <span style={{ color: '#2F80ED', fontSize: 14, marginRight: 10 }}><svg width="15" height="15" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3092 0C18.9949 0 18.668 0.125731 18.4291 0.36462L16.1282 2.6655L20.8431 7.38041L23.144 5.07953C23.6343 4.58918 23.6343 3.79708 23.144 3.30673L20.2019 0.36462C19.9504 0.113158 19.6361 0 19.3092 0ZM14.7831 7.569L15.9398 8.72573L4.54857 20.117H3.39185V18.9602L14.7831 7.569ZM0.877197 17.9167L14.783 4.01081L19.498 8.72572L5.59211 22.6316H0.877197V17.9167Z" fill="#2F80ED" />
                                                </svg>
                                                </span>
                                                {editingDescriptionId === task.id ? (
                                                    <textarea
                                                        value={editingDescriptionValue}
                                                        autoFocus
                                                        rows={2}
                                                        onChange={e => setEditingDescriptionValue(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                const isCompleted = task.completed;
                                                                if (isCompleted) {
                                                                    const updated = [...completedTasks];
                                                                    const idx2 = updated.findIndex(t => t.id === task.id);
                                                                    if (idx2 !== -1) {
                                                                        updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                        setCompletedTasks(updated);
                                                                    }
                                                                } else {
                                                                    const updated = [...tasks];
                                                                    const idx2 = updated.findIndex(t => t.id === task.id);
                                                                    if (idx2 !== -1) {
                                                                        updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                        setTasks(updated);
                                                                    }
                                                                }
                                                                setEditingDescriptionId(null);
                                                            }
                                                        }}
                                                        onBlur={() => setEditingDescriptionId(null)}
                                                        style={{ width: '325px', fontSize: 12, marginBottom: 8, backgroundColor: 'white', color: 'black', borderRadius: 5, padding: 7, border: '1px solid black', resize: 'vertical' }}
                                                        placeholder="No Description"
                                                    />
                                                ) : (
                                                    <span
                                                        style={{ color: 'black', fontSize: 12, maxWidth: 480, overflow: 'hidden', textAlign: 'justify', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setEditingDescriptionId(task.id);
                                                            setEditingDescriptionValue(task.description === 'No Description' ? '' : task.description);
                                                        }}
                                                    >
                                                        {task.description && task.description.trim() ? task.description : 'No Description'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ borderBottom: '1px solid black', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Checkbox
                                                checked={task.completed}
                                                onChange={() => handleCheck(task.id, task.completed)}
                                            />
                                            <span style={{ fontWeight: 600, color: 'black', fontSize: 14, maxWidth: 325, overflow: 'hidden' }}>{task.title}</span>
                                            <span style={{ color: getDaysLeftColor(task.daysLeft), fontSize: 12, alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 'auto' }}>{task.daysLeft} Days Left</span>
                                            <span style={{ color: 'black', fontSize: 12, alignItems: 'flex-end', marginRight: 2 }}>{task.dueDate}</span>
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                style={{ cursor: 'pointer', transform: expandedTaskIds.includes(task.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                                onClick={() => {
                                                    setExpandedTaskIds(prev =>
                                                        prev.includes(task.id)
                                                            ? prev.filter(id => id !== task.id)
                                                            : [...prev, task.id]
                                                    );
                                                }}
                                            >
                                                <path d="M1.175 7.0875L5 3.27084L8.825 7.0875L10 5.9125L5 0.912503L-1.02722e-07 5.9125L1.175 7.0875Z" fill="#4F4F4F" />
                                            </svg>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setDropdownTaskId(task.id === dropdownTaskId ? null : task.id);
                                                    }}
                                                >
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.5 1.75C10.5 2.7125 11.2875 3.5 12.25 3.5C13.2125 3.5 14 2.7125 14 1.75C14 0.7875 13.2125 -3.44227e-08 12.25 -7.64949e-08C11.2875 -1.18567e-07 10.5 0.7875 10.5 1.75ZM8.75 1.75C8.75 0.7875 7.9625 -2.63908e-07 7 -3.0598e-07C6.0375 -3.48052e-07 5.25 0.7875 5.25 1.75C5.25 2.7125 6.0375 3.5 7 3.5C7.9625 3.5 8.75 2.7125 8.75 1.75ZM1.75 -5.35465e-07C2.7125 -4.93392e-07 3.5 0.7875 3.5 1.75C3.5 2.7125 2.7125 3.5 1.75 3.5C0.7875 3.5 -1.18567e-07 2.7125 -7.64949e-08 1.75C-3.44227e-08 0.787499 0.7875 -5.77537e-07 1.75 -5.35465e-07Z" fill="#828282" />
                                                </svg>
                                                {dropdownTaskId === task.id && (
                                                    <div style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px #0002', zIndex: 10, transform: 'translateX(-90%)', top: 22 }}>
                                                        <div
                                                            style={{ padding: '8px 16px', cursor: 'pointer', color: 'red', whiteSpace: 'nowrap' }}
                                                            onClick={() => handleDeleteTask(task.id, task.completed)}
                                                        >
                                                            Delete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {expandedTaskIds.includes(task.id) && (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 35 }}>
                                                    <span style={{ color: 'white', fontSize: 14, marginRight: 10 }}><svg width="17" height="17" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.2508 2.51465C8.31048 2.51465 2.69031 8.1474 2.69031 15.0877C2.69031 22.0281 8.31048 27.6608 15.2508 27.6608C22.2038 27.6608 27.8365 22.0281 27.8365 15.0877C27.8365 8.1474 22.2038 2.51465 15.2508 2.51465ZM15.2637 25.1462C9.70636 25.1462 5.20519 20.6451 5.20519 15.0878C5.20519 9.53045 9.70636 5.02928 15.2637 5.02928C20.821 5.02928 25.3221 9.53045 25.3221 15.0878C25.3221 20.6451 20.821 25.1462 15.2637 25.1462ZM14.0061 8.80121H15.8921V15.4021L21.55 18.7591L20.607 20.3056L14.0061 16.3451V8.80121Z" fill="#2F80ED" />
                                                    </svg>
                                                    </span>
                                                    <DateInput value={task.dueDate} onChange={setDate} />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginLeft: 35 }}>
                                                    <span style={{ color: '#2F80ED', fontSize: 14, marginRight: 10 }}><svg width="15" height="15" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3092 0C18.9949 0 18.668 0.125731 18.4291 0.36462L16.1282 2.6655L20.8431 7.38041L23.144 5.07953C23.6343 4.58918 23.6343 3.79708 23.144 3.30673L20.2019 0.36462C19.9504 0.113158 19.6361 0 19.3092 0ZM14.7831 7.569L15.9398 8.72573L4.54857 20.117H3.39185V18.9602L14.7831 7.569ZM0.877197 17.9167L14.783 4.01081L19.498 8.72572L5.59211 22.6316H0.877197V17.9167Z" fill="#2F80ED" />
                                                    </svg>
                                                    </span>
                                                    {editingDescriptionId === task.id ? (
                                                        <textarea
                                                            value={editingDescriptionValue}
                                                            autoFocus
                                                            rows={2}
                                                            onChange={e => setEditingDescriptionValue(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    const isCompleted = task.completed;
                                                                    if (isCompleted) {
                                                                        const updated = [...completedTasks];
                                                                        const idx2 = updated.findIndex(t => t.id === task.id);
                                                                        if (idx2 !== -1) {
                                                                            updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                            setCompletedTasks(updated);
                                                                        }
                                                                    } else {
                                                                        const updated = [...tasks];
                                                                        const idx2 = updated.findIndex(t => t.id === task.id);
                                                                        if (idx2 !== -1) {
                                                                            updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                            setTasks(updated);
                                                                        }
                                                                    }
                                                                    setEditingDescriptionId(null);
                                                                }
                                                            }}
                                                            onBlur={() => setEditingDescriptionId(null)}
                                                            style={{ width: '325px', fontSize: 12, marginBottom: 8, backgroundColor: 'white', color: 'black', borderRadius: 5, padding: 7, border: '1px solid black', resize: 'vertical' }}
                                                            placeholder="No Description"
                                                        />
                                                    ) : (
                                                        <span
                                                            style={{ color: 'black', fontSize: 12, maxWidth: 480, overflow: 'hidden', textAlign: 'justify', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setEditingDescriptionId(task.id);
                                                                setEditingDescriptionValue(task.description === 'No Description' ? '' : task.description);
                                                            }}
                                                        >
                                                            {task.description && task.description.trim() ? task.description : 'No Description'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 35 }}>
                                                    <span style={{ color: 'white', fontSize: 14, marginRight: 10 }}><svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4032 0.833374H5.52334C4.65742 0.833374 3.95681 1.58337 3.95681 2.50004H11.8288C12.6947 2.50004 13.4032 3.25004 13.4032 4.16671V15L14.9776 15.8334V2.50004C14.9776 1.58337 14.2691 0.833374 13.4032 0.833374ZM10.2545 5.83337V16.6417L6.94038 15.1334L6.31849 14.85L5.69661 15.1334L2.38249 16.6417V5.83337H10.2545ZM2.38245 4.16671H10.2545C11.1204 4.16671 11.8289 4.91671 11.8289 5.83337V19.1667L6.31845 16.6667L0.808044 19.1667V5.83337C0.808044 4.91671 1.51653 4.16671 2.38245 4.16671Z" fill="#2F80ED" />
                                                    </svg>
                                                    </span>
                                                    <div>
                                                        <CustomDropdown />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Completed Tasks */}
                        {completedTasks.map(task => (
                            <div style={{ borderBottom: '1px solid black', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Checkbox
                                        checked={task.completed}
                                        onChange={() => handleCheck(task.id, task.completed)}
                                    />
                                    <span style={{ textDecoration: 'line-through', color: '#888', fontWeight: 600, maxWidth: 325, overflow: 'hidden', fontSize: 14 }}>{task.title}</span>
                                    <span style={{ fontSize: 12, alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 'auto', color: 'white' }}>{task.daysLeft} Days Left</span>
                                    <span style={{ color: 'black', fontSize: 12, alignItems: 'flex-end', marginRight: 2 }}>{task.dueDate}</span>
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"
                                        style={{ cursor: 'pointer', transform: expandedTaskIds.includes(task.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                        onClick={() => {
                                            setExpandedTaskIds(prev =>
                                                prev.includes(task.id)
                                                    ? prev.filter(id => id !== task.id)
                                                    : [...prev, task.id]
                                            );
                                        }}
                                    >
                                        <path d="M1.175 7.0875L5 3.27084L8.825 7.0875L10 5.9125L5 0.912503L-1.02722e-07 5.9125L1.175 7.0875Z" fill="#4F4F4F" />
                                    </svg>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg"
                                            style={{ cursor: 'pointer' }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setDropdownTaskId(task.id === dropdownTaskId ? null : task.id);
                                            }}
                                        >
                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.5 1.75C10.5 2.7125 11.2875 3.5 12.25 3.5C13.2125 3.5 14 2.7125 14 1.75C14 0.7875 13.2125 -3.44227e-08 12.25 -7.64949e-08C11.2875 -1.18567e-07 10.5 0.7875 10.5 1.75ZM8.75 1.75C8.75 0.7875 7.9625 -2.63908e-07 7 -3.0598e-07C6.0375 -3.48052e-07 5.25 0.7875 5.25 1.75C5.25 2.7125 6.0375 3.5 7 3.5C7.9625 3.5 8.75 2.7125 8.75 1.75ZM1.75 -5.35465e-07C2.7125 -4.93392e-07 3.5 0.7875 3.5 1.75C3.5 2.7125 2.7125 3.5 1.75 3.5C0.7875 3.5 -1.18567e-07 2.7125 -7.64949e-08 1.75C-3.44227e-08 0.787499 0.7875 -5.77537e-07 1.75 -5.35465e-07Z" fill="#828282" />
                                        </svg>
                                        {dropdownTaskId === task.id && (
                                            <div style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px #0002', zIndex: 10, transform: 'translateX(-90%)', top: 22 }}>
                                                <div
                                                    style={{ padding: '8px 16px', cursor: 'pointer', color: 'red', whiteSpace: 'nowrap' }}
                                                    onClick={() => handleDeleteTask(task.id, task.completed)}
                                                >
                                                    Delete
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {expandedTaskIds.includes(task.id) && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 35 }}>
                                            <span style={{ color: 'white', fontSize: 14, marginRight: 10 }}><svg width="17" height="17" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.2508 2.51465C8.31048 2.51465 2.69031 8.1474 2.69031 15.0877C2.69031 22.0281 8.31048 27.6608 15.2508 27.6608C22.2038 27.6608 27.8365 22.0281 27.8365 15.0877C27.8365 8.1474 22.2038 2.51465 15.2508 2.51465ZM15.2637 25.1462C9.70636 25.1462 5.20519 20.6451 5.20519 15.0878C5.20519 9.53045 9.70636 5.02928 15.2637 5.02928C20.821 5.02928 25.3221 9.53045 25.3221 15.0878C25.3221 20.6451 20.821 25.1462 15.2637 25.1462ZM14.0061 8.80121H15.8921V15.4021L21.55 18.7591L20.607 20.3056L14.0061 16.3451V8.80121Z" fill="#2F80ED" />
                                            </svg>
                                            </span>
                                            <DateInput value={task.dueDate} onChange={setDate} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 35 }}>
                                            <span style={{ color: '#2F80ED', fontSize: 14, marginRight: 10 }}><svg width="15" height="15" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3092 0C18.9949 0 18.668 0.125731 18.4291 0.36462L16.1282 2.6655L20.8431 7.38041L23.144 5.07953C23.6343 4.58918 23.6343 3.79708 23.144 3.30673L20.2019 0.36462C19.9504 0.113158 19.6361 0 19.3092 0ZM14.7831 7.569L15.9398 8.72573L4.54857 20.117H3.39185V18.9602L14.7831 7.569ZM0.877197 17.9167L14.783 4.01081L19.498 8.72572L5.59211 22.6316H0.877197V17.9167Z" fill="#2F80ED" />
                                            </svg>
                                            </span>
                                            {editingDescriptionId === task.id ? (
                                                <textarea
                                                    value={editingDescriptionValue}
                                                    autoFocus
                                                    rows={2}
                                                    onChange={e => setEditingDescriptionValue(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            const isCompleted = task.completed;
                                                            if (isCompleted) {
                                                                const updated = [...completedTasks];
                                                                const idx2 = updated.findIndex(t => t.id === task.id);
                                                                if (idx2 !== -1) {
                                                                    updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                    setCompletedTasks(updated);
                                                                }
                                                            } else {
                                                                const updated = [...tasks];
                                                                const idx2 = updated.findIndex(t => t.id === task.id);
                                                                if (idx2 !== -1) {
                                                                    updated[idx2].description = editingDescriptionValue.trim() ? editingDescriptionValue : 'No Description';
                                                                    setTasks(updated);
                                                                }
                                                            }
                                                            setEditingDescriptionId(null);
                                                        }
                                                    }}
                                                    onBlur={() => setEditingDescriptionId(null)}
                                                    style={{ width: '325px', fontSize: 12, marginBottom: 8, backgroundColor: 'white', color: 'black', borderRadius: 5, padding: 7, border: '1px solid black', resize: 'vertical' }}
                                                    placeholder="No Description"
                                                />
                                            ) : (
                                                <span
                                                    style={{ color: 'black', fontSize: 12, maxWidth: 480, overflow: 'hidden', textAlign: 'justify', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setEditingDescriptionId(task.id);
                                                        setEditingDescriptionValue(task.description === 'No Description' ? '' : task.description);
                                                    }}
                                                >
                                                    {task.description && task.description.trim() ? task.description : 'No Description'}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Task