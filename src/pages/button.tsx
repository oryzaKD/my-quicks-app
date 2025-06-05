import { useState } from 'react'
import '../App.css'
import Inbox from './inbox'
import Dialog from '../components/Dialog'
import Task from './task'

function Button() {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showInboxDialog, setShowInboxDialog] = useState(false)

  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [isLoadingTask, setIsLoadingTask] = useState(false)

  const handleTaskClick = () => {
    console.log('Task button clicked!', { showInboxDialog, showTaskDialog })

    // Close inbox dialog if it's open
    if (showInboxDialog) {
      console.log('Closing inbox dialog to open task')
      setShowInboxDialog(false)
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
    } else {
      console.log('Opening inbox dialog')
      setShowInboxDialog(true)
      setShowQuickActions(false)

    }
  }

  const closeDialogInbox = () => {
    setShowInboxDialog(false)
  }

  const closeDialogTask = () => {
    setShowTaskDialog(false)
    setIsLoadingTask(false)
  }

  return (
    <div className="messaging">
      {/* Inbox Dialog Modal */}
      <Dialog isOpen={showInboxDialog} onClose={closeDialogInbox}>
        <Inbox onClose={closeDialogInbox} />
      </Dialog>

      {/* Task Dialog Modal */}
      <Dialog isOpen={showTaskDialog} onClose={closeDialogTask}>
        <Task onClose={closeDialogTask} isLoadingTask={isLoadingTask} />
      </Dialog>

      {/* Actions Button */}
      <div className="quick-actions">
        {/* When no dialogs are open, show the toggle button and expandable menu */}
        {!showInboxDialog && !showTaskDialog && (
          <>
            <button
              className="quick-actions-toggle"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <svg width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4427 0.335929C13.3618 0.948634 13.6101 2.19037 12.9974 3.10943L5.73704 14H16C16.7376 14 17.4153 14.406 17.7634 15.0563C18.1114 15.7066 18.0732 16.4957 17.6641 17.1094L8.33077 31.1094C7.71807 32.0285 6.47633 32.2768 5.55727 31.6641C4.63821 31.0514 4.38986 29.8097 5.00257 28.8906L12.263 18H2C1.26241 18 0.584692 17.5941 0.236654 16.9437C-0.111384 16.2934 -0.0732391 15.5043 0.335902 14.8906L9.66924 0.890629C10.2819 -0.0284284 11.5237 -0.276776 12.4427 0.335929Z" fill="white" />
              </svg>
            </button>
            {showQuickActions && (
              <div className="quick-actions-menu">
                {/* Inbox */}
                <div className="quick-action-item">
                  <span className="quick-action-label">Inbox</span>
                  <div className="quick-action-icon" onClick={handleInboxClick}><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4443 3.11066H3.99984C3.38873 3.11066 2.88873 3.61066 2.88873 4.22177V19.7773L7.33318 15.3329H18.4443C19.0554 15.3329 19.5554 14.8329 19.5554 14.2218V4.22177C19.5554 3.61066 19.0554 3.11066 18.4443 3.11066ZM17.3332 5.3328V13.1106H6.41097L5.75541 13.7661L5.11097 14.4106V5.3328H17.3332ZM21.7776 7.55512H23.9998C24.611 7.55512 25.111 8.05512 25.111 8.66623V25.3329L20.6665 20.8885H8.44429C7.83317 20.8885 7.33317 20.3885 7.33317 19.7773V17.5551H21.7776V7.55512Z" fill="#8885FF" />
                  </svg>
                  </div>
                </div>
                {/* Task */}
                <div className="quick-action-item">
                  <span className="quick-action-label">Task</span>
                  <div className="quick-action-icon" onClick={handleTaskClick}><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.11117 4.66669H24.1112C25.3334 4.66669 26.3334 5.66669 26.3334 6.88891V21.3334C26.3334 22.5556 25.3334 23.5556 24.1112 23.5556H4.11117C2.88895 23.5556 1.88895 22.5556 1.88895 21.3334V6.88891C1.88895 5.66669 2.88895 4.66669 4.11117 4.66669ZM4.11117 6.88891V21.3334H13.0001V6.88891H4.11117ZM24.1112 21.3334H15.2223V6.88891H24.1112V21.3334ZM23.0001 10.7778H16.3334V12.4445H23.0001V10.7778ZM16.3334 13.5556H23.0001V15.2222H16.3334V13.5556ZM23.0001 16.3334H16.3334V18H23.0001V16.3334Z" fill="#F8B76B" />
                  </svg>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* When dialogs are open, show individual buttons directly */}
        {(showInboxDialog) && (
          <div>
            <div className="tucked-buttons">
              <button className="tucked-btn back-btn" tabIndex={-1} aria-hidden="true"></button>
              <button className="tucked-btn front-btn" onClick={closeDialogInbox} title={showTaskDialog ? 'Task (Active)' : 'Switch to Task'} style={{ cursor: 'pointer', backgroundColor: '#8885FF' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4443 3.11066H3.99984C3.38873 3.11066 2.88873 3.61066 2.88873 4.22177V19.7773L7.33318 15.3329H18.4443C19.0554 15.3329 19.5554 14.8329 19.5554 14.2218V4.22177C19.5554 3.61066 19.0554 3.11066 18.4443 3.11066ZM17.3332 5.3328V13.1106H6.41097L5.75541 13.7661L5.11097 14.4106V5.3328H17.3332ZM21.7776 7.55512H23.9998C24.611 7.55512 25.111 8.05512 25.111 8.66623V25.3329L20.6665 20.8885H8.44429C7.83317 20.8885 7.33317 20.3885 7.33317 19.7773V17.5551H21.7776V7.55512Z" fill="white" />
                </svg>
              </button>
            </div>
            <div className="quick-actions-menu">
              {/* Task */}
              <div className="quick-action-item">
                <div className="quick-action-icon" onClick={handleTaskClick}><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.11117 4.66669H24.1112C25.3334 4.66669 26.3334 5.66669 26.3334 6.88891V21.3334C26.3334 22.5556 25.3334 23.5556 24.1112 23.5556H4.11117C2.88895 23.5556 1.88895 22.5556 1.88895 21.3334V6.88891C1.88895 5.66669 2.88895 4.66669 4.11117 4.66669ZM4.11117 6.88891V21.3334H13.0001V6.88891H4.11117ZM24.1112 21.3334H15.2223V6.88891H24.1112V21.3334ZM23.0001 10.7778H16.3334V12.4445H23.0001V10.7778ZM16.3334 13.5556H23.0001V15.2222H16.3334V13.5556ZM23.0001 16.3334H16.3334V18H23.0001V16.3334Z" fill="#F8B76B" />
                </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        {(showTaskDialog) && (
          <div>
            <div className="tucked-buttons">
              <button className="tucked-btn back-btn" tabIndex={-1} aria-hidden="true"></button>
              <button className="tucked-btn front-btn" onClick={closeDialogTask} title={showInboxDialog ? 'Inbox (Active)' : 'Switch to Inbox'} style={{ cursor: 'pointer', backgroundColor: '#F8B76B' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.11117 4.66669H24.1112C25.3334 4.66669 26.3334 5.66669 26.3334 6.88891V21.3334C26.3334 22.5556 25.3334 23.5556 24.1112 23.5556H4.11117C2.88895 23.5556 1.88895 22.5556 1.88895 21.3334V6.88891C1.88895 5.66669 2.88895 4.66669 4.11117 4.66669ZM4.11117 6.88891V21.3334H13.0001V6.88891H4.11117ZM24.1112 21.3334H15.2223V6.88891H24.1112V21.3334ZM23.0001 10.7778H16.3334V12.4445H23.0001V10.7778ZM16.3334 13.5556H23.0001V15.2222H16.3334V13.5556ZM23.0001 16.3334H16.3334V18H23.0001V16.3334Z" fill="white" />
                </svg>
              </button>
            </div>
            <div className="quick-actions-menu">
              {/* Inbox */}
              <div className="quick-action-item">
                <span className="quick-action-label">Inbox</span>
                <div className="quick-action-icon" onClick={handleInboxClick}><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4443 3.11066H3.99984C3.38873 3.11066 2.88873 3.61066 2.88873 4.22177V19.7773L7.33318 15.3329H18.4443C19.0554 15.3329 19.5554 14.8329 19.5554 14.2218V4.22177C19.5554 3.61066 19.0554 3.11066 18.4443 3.11066ZM17.3332 5.3328V13.1106H6.41097L5.75541 13.7661L5.11097 14.4106V5.3328H17.3332ZM21.7776 7.55512H23.9998C24.611 7.55512 25.111 8.05512 25.111 8.66623V25.3329L20.6665 20.8885H8.44429C7.83317 20.8885 7.33317 20.3885 7.33317 19.7773V17.5551H21.7776V7.55512Z" fill="#8885FF" />
                </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Button