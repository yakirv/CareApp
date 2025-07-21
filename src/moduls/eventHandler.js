import { eventHandler, ui } from '..'
import { helpers } from '..'
import { apiServices } from '..'

export class EventHandler {
    addFood
    addSleep
    newTaskName
    newTaskDesc
    newTaskButton
    container
    pullToRefresh
    startY
    currentY
    isRefreshing
    statusContainer
    loginButton
    logoutButton

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loginButton = document.getElementById('login-btn')
            this.logoutButton = document.getElementById('logout-btn')
            this.addFood = document.getElementById('add-food-action')
            this.addSleep = document.getElementById('add-sleep-action')
            this.newTaskButton = document.getElementById('submit-new-task')
            this.container = document.querySelector('.container')
            this.pullToRefresh = document.querySelector('.pull-to-refresh')
            this.startY = 0
            this.currentY = 0
            this.isRefreshing = false
            this.clickAddFood()
            this.clickNewTask()
            this.initPullToRefresh()
            this.initializeFabMenu()
            this.accountLogin()
            helpers.blur_inputValidate('task-name')
            helpers.focus_inputValidate('task-name')
            helpers.blur_inputValidate('task-description')
            helpers.focus_inputValidate('task-description')
            helpers.blur_inputValidate('task-hour')
            helpers.focus_inputValidate('task-hour')
        })
    }

    accountLogin() {
        this.loginButton.addEventListener('click', (event) => {
            console.log('Login button clicked')
            apiServices.loginWithGoogle()
        })
        this.logoutButton.addEventListener('click', (event) => {
            console.log('Logout button clicked')
            apiServices.logout()
        })
    }
    deviceSupportsHover() {
        // Primary check using media query
        if (window.matchMedia('(hover: hover)').matches) {
            return true
        }

        // Fallback detection for older browsers
        return !(
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        )
    }
    initPullToRefresh() {
        this.container.addEventListener('touchstart', (e) => {
            if (this.container.scrollTop === 0) {
                this.startY = e.touches[0].clientY
            }
        })

        this.container.addEventListener('touchmove', (e) => {
            if (this.container.scrollTop === 0 && !this.isRefreshing) {
                this.currentY = e.touches[0].clientY
                const pullDistance = this.currentY - this.startY

                if (pullDistance > 0) {
                    e.preventDefault()
                    const pullRatio = Math.min(pullDistance / 120, 1)
                    this.pullToRefresh.style.transform = `translateY(${pullDistance}px)`

                    if (pullRatio > 0.8) {
                        this.pullToRefresh.classList.add('active')
                    } else {
                        this.pullToRefresh.classList.remove('active')
                    }
                }
            }
        })

        this.container.addEventListener('touchend', () => {
            if (this.pullToRefresh.classList.contains('active')) {
                this.isRefreshing = true
                this.refreshData()
            }
            this.pullToRefresh.style.transform = ''
            this.pullToRefresh.classList.remove('active')
        })
    }

    refreshData() {
        try {
            ui.clearTaskList()
            ui.renderTasksList()
        } catch (error) {
            console.error('Error refreshing data:', error)
        } finally {
            this.isRefreshing = false
        }
    }

    clickNewTask() {
        this.newTaskButton.addEventListener('click', (event) => {
            const newTaskForm = document.getElementById('new-task-form')
            event.preventDefault()
            const formData = new FormData(newTaskForm)
            const taskName = formData.get('new-task-name')
            const taskDesc = formData.get('new-task-description')
            const taskHour = formData.get('new-task-hour')
            const hour = taskHour ? new Date(taskHour) : new Date()
            const validateName = helpers.inputValidation('task-name')
            const validateDesc = helpers.inputValidation('task-description')
            const validateHour = helpers.inputValidation('task-hour')
            let uid = null

            if (
                validateName.isvalid &&
                validateDesc.isvalid &&
                validateHour.isvalid
            ) {
                apiServices.createTask(
                    taskName,
                    taskDesc,
                    'waiting',
                    hour.toLocaleString('sv-SE', {
                        timeZone: 'Asia/Jerusalem',
                    }),
                    (uid = helpers.getFirebaseUidFromIndexedDB())
                )
                ui.taskfutureModal.close()
                this.refreshData()
                newTaskForm.reset()
            }
        })
    }

    clickAddFood() {
        let user_id = helpers.getFirebaseUidFromIndexedDB().then((uid) => {
            if (uid) {
                user_id = uid
            } else {
                user_id = null
            }
        })
        this.addFood.addEventListener('click', () => {
            const now = new Date()

            apiServices
                .createTask(
                    'נוטרילון',
                    '200 מ״ל',
                    'done',
                    new Date().toLocaleString('sv-SE', {
                        timeZone: 'Asia/Jerusalem',
                    }),
                    user_id
                )
                .then(() => {
                    apiServices.createTask(
                        'נוטרילון',
                        '200 מ״ל',
                        'waiting',
                        new Date(
                            now.getTime() + 4 * 60 * 60 * 1000
                        ).toLocaleString('sv-SE', {
                            timeZone: 'Asia/Jerusalem',
                        }),
                        user_id
                    )
                })
                .then(() => {
                    console.log('Food task added successfully')
                    this.refreshData()
                })
                .catch((error) => {
                    console.error('Error adding food task:', error)
                })
        })
    }

    deleteTask(id) {
        apiServices
            .deleteTask(id)
            .then(() => {
                console.log(`Task ${id} deleted successfully`)
                this.refreshData()
            })
            .catch((error) => {
                console.error(`Error deleting task ${id}:`, error)
            })
    }

    changeTaskStatus(id, status) {
        apiServices
            .updateTask(id, null, null, status)
            .then(() => {
                console.log(`Task ${id} status changed to ${status}`)
                this.refreshData()
            })
            .catch((error) => {
                console.error(`Error changing task ${id} status:`, error)
            })
    }

    enterEditMode(paragraph, editActions, editIcon) {
        if (!paragraph || !editActions) {
            console.error('Missing required elements for edit mode')
            return
        }

        paragraph.contentEditable = 'true'
        paragraph.classList.add('editing')

        // Safely handle aria-label
        const currentAriaLabel = paragraph.getAttribute('aria-label') || ''
        if (!currentAriaLabel.includes('(editing)')) {
            paragraph.setAttribute(
                'aria-label',
                `${currentAriaLabel} (editing)`
            )
        }

        // Focus and set cursor at the end
        paragraph.focus()

        // Place cursor at end of text
        const selection = window.getSelection()
        const range = document.createRange()

        // Make sure the paragraph has content to select
        if (paragraph.childNodes.length > 0) {
            const lastChild =
                paragraph.childNodes[paragraph.childNodes.length - 1]
            range.setStart(lastChild, lastChild.length || 0)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        }
        editActions.style.display = 'flex'
        // Update UI - hide edit icon and show edit actions
        if (editIcon) {
            editIcon.style.display = 'none'
        } else {
            // If editIcon not provided, find it as a sibling
            const parentContainer = paragraph.parentElement
            if (parentContainer) {
                const editIconElement =
                    parentContainer.querySelector('.edit-icon')
                if (editIconElement) {
                    editIconElement.style.display = 'none'
                }
            }
        }
    }

    exitEditMode(save, paragraph, editActions, origName, id, editIcon) {
        if (!paragraph || !editActions) {
            console.error('Missing required elements for exiting edit mode')
        }

        // Handle content restoration if not saving
        if (!save) {
            paragraph.textContent = origName // Use textContent instead of innerHTML for safety
        }

        // Only proceed if there's valid content
        if (paragraph.textContent.trim().length > 0) {
            // Save changes if needed
            if (save && id) {
                if (paragraph.id === 'work-item-name') {
                    apiServices.updateTask(id, paragraph.textContent.trim()),
                        null,
                        null
                } else if (paragraph.id === 'work-item-description') {
                    apiServices.updateTask(
                        id,
                        null,
                        paragraph.textContent.trim(),
                        null
                    )
                }
            }

            // Reset paragraph state
            paragraph.contentEditable = 'false'
            paragraph.classList.remove('editing')

            // Safely handle aria-label
            const currentAriaLabel = paragraph.getAttribute('aria-label') || ''
            paragraph.setAttribute(
                'aria-label',
                currentAriaLabel.replace(' (editing)', '')
            )
            editActions.style.display = 'none'
            // The edit icon should be managed by mouseover/mouseout events, not hidden permanently
            if (editIcon) {
                // Initially hide it, mouseover will show it again when needed
                editIcon.style.display = 'none'
            }
        } else {
            // Handle empty content case
            console.warn('Cannot save empty task name')
            paragraph.textContent = origName // Restore original name
        }
    }
    attachEventListeners(
        itemName,
        actionsContainer,
        editIcon,
        originalName,
        id
    ) {
        // Item name click - enter edit mode
        itemName.addEventListener('click', () => {
            eventHandler.enterEditMode(itemName, actionsContainer, editIcon)
        })

        // Mouse out - hide edit icon
        itemName.addEventListener('mouseout', () => {
            editIcon.style.display = 'none'
        })

        // Mouse over - show edit icon
        if (this.deviceSupportsHover()) {
            // Mouse over - show edit icon
            itemName.addEventListener('mouseover', () => {
                if (itemName.contentEditable !== 'true') {
                    // Find the edit icon (now a sibling of itemName)
                    const parentContainer = itemName.parentElement
                    if (parentContainer) {
                        const editIconElement =
                            parentContainer.querySelector('.edit-icon')
                        if (editIconElement) {
                            editIconElement.style.display = 'inline'
                        }
                    }
                }
            })
        }

        itemName.addEventListener('blur', (e) => {
            // Check if the click was inside the actions container to prevent conflicts
            // with save/cancel button clicks
            const isClickInsideActions =
                e.relatedTarget &&
                (actionsContainer.contains(e.relatedTarget) ||
                    actionsContainer === e.relatedTarget)

            if (itemName.contentEditable === 'true' && !isClickInsideActions) {
                // Only trigger cancel if we're not clicking on the actions buttons
                eventHandler.exitEditMode(
                    false,
                    itemName,
                    actionsContainer,
                    originalName,
                    id,
                    editIcon
                )
            }
        })
        // Keyboard shortcuts for editing
        itemName.addEventListener('keydown', (e) => {
            if (itemName.contentEditable === 'true') {
                if (e.key === 'Escape') {
                    eventHandler.exitEditMode(
                        false,
                        itemName,
                        actionsContainer,
                        originalName,
                        id,
                        editIcon
                    )
                    e.preventDefault()
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    eventHandler.exitEditMode(
                        true,
                        itemName,
                        actionsContainer,
                        id,
                        editIcon
                    )
                    e.preventDefault()
                }
            }
        })

        // Save and cancel buttons
        const saveButton = actionsContainer.querySelector('.save-button')
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                console.log('Save button clicked')
                this.exitEditMode(
                    true,
                    itemName,
                    actionsContainer,
                    originalName,
                    id,
                    editIcon
                )
            })
        }

        // Status change and delete buttons
        const statusButton = document.querySelector(
            `button[aria-label="${id}"].status-button`
        )
        if (statusButton) {
            // Remove any existing click listeners
            statusButton.replaceWith(statusButton.cloneNode(true))
            const newStatusButton = document.querySelector(
                `button[aria-label="${id}"].status-button`
            )
            newStatusButton.addEventListener('click', () => {
                if (newStatusButton.classList.contains('change-to-waiting')) {
                    eventHandler.changeTaskStatus(id, 'waiting')
                }
                if (newStatusButton.classList.contains('change-to-done')) {
                    eventHandler.changeTaskStatus(id, 'done')
                }
            })
        }

        const deleteButton = document.querySelector(
            `#work-item-delete[data-task-id="${id}"]`
        )
        if (deleteButton) {
            const newDeleteButton = deleteButton.cloneNode(true)
            deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton)
            newDeleteButton.addEventListener('click', () => {
                eventHandler.deleteTask(id)
            })
        }
    }

    initializeFabMenu() {
        const fabCheckbox = document.getElementById('fabCheckbox')
        const fabActions = document.querySelectorAll('.fab-action')

        fabActions.forEach((action) => {
            action.addEventListener('click', () => {
                fabCheckbox.checked = false
            })
        })
    }
}
