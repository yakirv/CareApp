import { eventHandler, ui } from '..'
import { validations } from '..'
import { storage } from '..'

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

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addFood = document.getElementById('add-food-action')
            this.addSleep = document.getElementById('add-sleep-action')
            this.newTaskButton = document.getElementById('submit-new-task')
            this.container = document.querySelector('.container')
            this.pullToRefresh = document.querySelector('.pull-to-refresh')
            this.startY = 0
            this.currentY = 0
            this.isRefreshing = false
            this.clickAddFood()
            this.clickAddSleep()
            this.clickNewTask()
            this.initPullToRefresh()
            validations.blur_inputValidate('task-name')
            validations.focus_inputValidate('task-name')
            validations.blur_inputValidate('task-description')
            validations.focus_inputValidate('task-description')
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
            const hour = new Date()
            const validateName = validations.inputValidation('task-name')
            const validateDesc = validations.inputValidation('task-description')

            if (validateName.isvalid && validateDesc.isvalid) {
                storage.storeTasks(taskName, taskDesc, hour)
                this.refreshData()
                newTaskForm.reset()
            }
        })
    }

    clickAddFood() {
        this.addFood.addEventListener('click', () => {
            storage.storeTasks('נוטרילון', '200 מ״ל', new Date())
            this.refreshData()
        })
    }
    clickAddSleep() {
        this.addSleep.addEventListener('click', () => {
            storage.storeTasks('שינה', 'שעתיים', new Date())
            this.refreshData()
        })
    }
    deleteTask(id) {
        const storedArray = localStorage.getItem('tasksList')
        const taskArray = JSON.parse(storedArray)
        const updatedDataString = JSON.stringify(
            storage.deleteTaskFromStorage(taskArray, id)
        )

        localStorage.setItem('tasksList', updatedDataString)
        this.refreshData()
    }

    changeTaskStatus(id) {
        const storedArray = localStorage.getItem('tasksList')
        const taskArray = JSON.parse(storedArray)

        taskArray.forEach((task) => {
            if (task.id === id) {
                if (task.status === 'waiting') {
                    task.status = 'done'
                    task.hour = new Date()
                    const updatedDataString = JSON.stringify(taskArray)
                    localStorage.setItem('tasksList', updatedDataString)
                    eventHandler.refreshData()
                } else {
                    task.status = 'waiting'
                    task.hour = new Date()
                    const updatedDataString = JSON.stringify(taskArray)
                    localStorage.setItem('tasksList', updatedDataString)
                    eventHandler.refreshData()
                }
            }
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
            return
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
                    storage.editTaskName(
                        id,
                        paragraph.textContent.trim(),
                        'taskName'
                    )
                } else if (paragraph.id === 'work-item-description') {
                    storage.editTaskName(
                        id,
                        paragraph.textContent.trim(),
                        'descName'
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
                eventHandler.exitEditMode(
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
                eventHandler.changeTaskStatus(id)
            })
        }

        const deleteButton = document.querySelector(
            `#work-item-delete[data-task-id="${id}"]`
        )
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                eventHandler.deleteTask(id)
            })
        }
    }
}
