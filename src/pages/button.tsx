import { useState } from 'react'
import '../App.css'
import Inbox from './inbox'
import Dialog from '../components/Dialog'
import Task from './task'

function Button() {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showInboxDialog, setShowInboxDialog] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [isLoadingTask, setIsLoadingTask] = useState(false)

  const handleTaskClick = () => {
    console.log('Task button clicked!', { showInboxDialog, showTaskDialog })
    
    // Close inbox dialog if it's open
    if (showInboxDialog) {
      console.log('Closing inbox dialog to open task')
      setShowInboxDialog(false)
      setIsLoadingChats(false)
    }
    
    // Toggle task dialog
    if (showTaskDialog) {
      console.log('Closing task dialog')
      setShowTaskDialog(false)
      setIsLoadingTask(false)
    } else {
      console.log('Opening task dialog')
      setShowTaskDialog(true)
      setIsLoadingTask(true)
      setShowQuickActions(false)
      
      
      setTimeout(() => {
        setIsLoadingTask(false)
      }, 2000)
    }
  }

  const handleInboxClick = () => {
    console.log('Inbox button clicked!', { showInboxDialog, showTaskDialog })
    
    // Close task dialog if it's open
    if (showTaskDialog) {
      console.log('Closing task dialog to open inbox')
      setShowTaskDialog(false)
      setIsLoadingTask(false)
    }
    
    // Toggle inbox dialog
    if (showInboxDialog) {
      console.log('Closing inbox dialog')
      setShowInboxDialog(false)
      setIsLoadingChats(false)
    } else {
      console.log('Opening inbox dialog')
      setShowInboxDialog(true)
      setIsLoadingChats(true)
      setShowQuickActions(false)
      
      
      setTimeout(() => {
        setIsLoadingChats(false)
      }, 2000)
    }
  }

  const closeDialogInbox = () => {
    setShowInboxDialog(false)
    setIsLoadingChats(false)
  }

  const closeDialogTask = () => {
    setShowTaskDialog(false)
    setIsLoadingTask(false)
  }

  return (
    <div className="messaging">
      {/* Inbox Dialog Modal */}
      <Dialog isOpen={showInboxDialog} onClose={closeDialogInbox}>
        <Inbox onClose={closeDialogInbox} isLoadingChats={isLoadingChats}/>
      </Dialog>

      {/* Task Dialog Modal */}
      <Dialog isOpen={showTaskDialog} onClose={closeDialogTask}>
        <Task onClose={closeDialogTask} isLoadingTask={isLoadingTask}/>
      </Dialog>

      {/* Actions Floating Button */}
      <div className="quick-actions">
        {/* When no dialogs are open, show the toggle button and expandable menu */}
        {!showInboxDialog && !showTaskDialog && (
          <>
            <button 
              className="quick-actions-toggle"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              ⚡
            </button>
            {showQuickActions && (
              <div className="quick-actions-menu">
                <div className="quick-action-item">
                  <span className="quick-action-label">Task</span>
                  <div className="quick-action-icon task-icon" onClick={handleTaskClick}>📋</div>
                </div>
                <div className="quick-action-item">
                  <span className="quick-action-label">Inbox</span>
                  <div className="quick-action-icon inbox-icon" onClick={handleInboxClick}>💬</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* When dialogs are open, show individual buttons directly */}
        {(showInboxDialog || showTaskDialog) && (
          <div className="quick-actions-always-visible">
            <div className="quick-action-item">
              <div 
                className={`quick-action-icon task-icon ${showTaskDialog ? 'active' : ''}`}
                onClick={handleTaskClick}
                title={showTaskDialog ? 'Task (Active)' : 'Switch to Task'}
                style={{ cursor: 'pointer' }}
              >
                📋
              </div>
            </div>
            <div className="quick-action-item">
              <div 
                className={`quick-action-icon inbox-icon ${showInboxDialog ? 'active' : ''}`}
                onClick={handleInboxClick}
                title={showInboxDialog ? 'Inbox (Active)' : 'Switch to Inbox'}
                style={{ cursor: 'pointer' }}
              >
                💬
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Button