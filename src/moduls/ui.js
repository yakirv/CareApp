import { de } from 'date-fns/locale'
import { eventHandler, storage } from '..'
import editIcon from '../assets/edit_icon.png'

export class UI {
    workItemList
    menuIcon
    actions
    emptyMessage
    listHeader
    container
    openFutureModalButton
    closeFutureModalButton
    taskfutureModal
    taskHourInput
    futureTasksList
    currentTasksList

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.workItemList = document.querySelector('.work-item-list')
            this.futureTasksList = document.getElementById('future-task-list')
            this.currentTasksList = document.getElementById('current-task-list')
            this.menuIcon = document.getElementById('menu-icon')
            this.actions = document.getElementById('actions')
            this.emptyMessage = document.getElementById('empty-list')
            this.listHeader = document.getElementById('list-headers')
            this.container = document.querySelector('.container')
            this.taskHourInput = document.getElementById('task-hour')
            this.openFutureModalButton =
                document.getElementById('open-modal-button')
            this.closeFutureModalButton =
                document.getElementById('close-modal-button')
            this.taskfutureModal = document.getElementById('futureTaskModal')
            this.initialzeNewTaskModal()
            this.initializeMenu()
            this.renderTasksList()
        })
    }

    initializeMenu() {
        this.openMenu()
        this.closeMenu()
    }

    openMenu() {
        this.menuIcon.addEventListener('click', (e) => {
            e.stopPropagation()
            if (actions.style.visibility == 'hidden') {
                this.actions.style.visibility = 'visible'
                this.actions.style.opacity = '1'
                this.actions.style.zIndex = '99'
            } else {
                this.actions.style.visibility = 'hidden'
                this.actions.style.opacity = '0'
            }
        })
    }

    closeMenu() {
        document.documentElement.addEventListener('click', () => {
            this.actions.style.visibility = 'hidden'
            this.actions.style.opacity = '0'
        })
    }

    initialzeNewTaskModal() {
        this.openFutureModalButton.addEventListener('click', () => {
            /*   this.taskfutureModal.style.display = 'flex' */
            console.log('open modal')
            this.taskfutureModal.showModal()
        })
        this.closeFutureModalButton.addEventListener('click', () => {
            /*  this.taskfutureModal.style.display = 'none' */
            this.taskfutureModal.close()
        })
    }

    renderTasksList() {
        const currentTasks = JSON.parse(localStorage.getItem('tasksList')) || []
        const futureTasks =
            JSON.parse(localStorage.getItem('futureTasksList')) || []
        const allTasks = [...currentTasks, ...futureTasks]

        if (allTasks.length > 0) {
            this.emptyMessage.style.display = 'none'
            this.listHeader.style.display = 'flex'
            this.container.style.display = 'flex'

            // Add separator at the top if there are future tasks
            const futreSeparator = document.getElementById('future-separator')
            if (futureTasks.length > 0) {
                futreSeparator.style.display = 'block'
            } else {
                futreSeparator.style.display = 'none'
            }
            // Render future tasks
            futureTasks.forEach((task) => {
                const taskTime = this.convertHourToString(task.hour)
                this.newWorkItem(
                    task.name,
                    task.desc,
                    taskTime,
                    task.id,
                    task.status,
                    'future'
                )
            })

            // Render current tasks
            currentTasks.forEach((task) => {
                const taskTime = this.convertHourToString(task.hour)
                this.newWorkItem(
                    task.name,
                    task.desc,
                    taskTime,
                    task.id,
                    task.status
                )
            })

            eventHandler.statusContainer =
                document.getElementById('work-item-status')
        } else {
            this.emptyMessage.style.display = 'block'
            this.listHeader.style.display = 'none'
            this.container.style.display = 'block'
            this.container.style.textAlign = 'center'
        }
    }
    convertHourToString(hour) {
        const passedTime = storage.calculateTimePassed(hour)
        switch (passedTime[0]) {
            case 'days':
                return `לפני  ${passedTime[1]} ימים`
                break
            case 'hours':
                return `לפני  ${passedTime[1]} שעות`
                break
            case 'minutes':
                return `לפני  ${passedTime[1]} דקות`
                break
            case 'seconds':
                if (passedTime[1] < 1) {
                    return 'כעת'
                } else {
                    return `לפני  ${passedTime[1]} שניות`
                }
                break
            default:
                return storage.formatDate(passedTime[0])
        }
    }

    clearTaskList() {
        while (this.currentTasksList.firstChild) {
            this.currentTasksList.removeChild(this.currentTasksList.firstChild)
        }
        while (this.futureTasksList.firstChild) {
            this.futureTasksList.removeChild(this.futureTasksList.firstChild)
        }
    }

    newWorkItem(name, desc, hour, id, status, taskType) {
        // Create main components
        const newWorkItem = this.createElementWithClass('div', 'work-item')
        const { itemNameContainer, newItemName, actionsContainer, edit } =
            this.createNameSection(name, id)

        const {
            itemDescContainer,
            newItemDesc,
            editActionsContainer,
            editDescription,
        } = this.createDescriptionSection(desc, id)

        const newItemStatus = this.createStatusElement(id, status)
        const newItemHour = this.createHourElement(hour)
        const actionButtons = this.createActionButtons(id, status)

        // Assemble components
        newWorkItem.appendChild(itemNameContainer)
        newWorkItem.appendChild(newItemStatus)
        newWorkItem.appendChild(itemDescContainer)
        newWorkItem.appendChild(newItemHour)
        newWorkItem.appendChild(actionButtons)

        // Add to DOM
        if (taskType === 'future') {
            this.futureTasksList.appendChild(newWorkItem)
        } else {
            this.currentTasksList.appendChild(newWorkItem)
            this.blinkNewTask()
        }

        // Add event listeners separately after DOM creation
        eventHandler.attachEventListeners(
            newItemName,
            actionsContainer,
            edit,
            name,
            id
        )

        eventHandler.attachEventListeners(
            newItemDesc,
            editActionsContainer,
            editDescription,
            desc,
            id
        )

        return newWorkItem
    }

    // Helper functions for creating elements
    createElementWithClass(tagName, className) {
        const element = document.createElement(tagName)
        if (className) element.className = className
        return element
    }

    createNameSection(name, id) {
        const itemNameContainer = this.createElementWithClass(
            'div',
            'task-name-container'
        )

        // Create editable paragraph
        const newItemName = this.createElementWithClass('p', 'editable-para')
        newItemName.id = 'work-item-name'
        newItemName.textContent = name
        newItemName.setAttribute('aria-label', 'item-name')

        // Create edit icon
        const edit = document.createElement('img')
        edit.src = editIcon
        edit.style.display = 'none'
        edit.className = 'edit-icon'
        itemNameContainer.appendChild(edit)

        // Create edit actions container
        const actionsContainer = this.createElementWithClass(
            'div',
            'edit-actions'
        )
        actionsContainer.appendChild(
            this.createSaveButton(newItemName, actionsContainer, id, edit)
        )

        // Assemble
        itemNameContainer.appendChild(newItemName)
        itemNameContainer.appendChild(actionsContainer)

        return { itemNameContainer, newItemName, actionsContainer, edit }
    }

    createSaveButton(itemName, actionsContainer, id, edit) {
        const saveButton = this.createElementWithClass('button', 'save-button')
        saveButton.setAttribute('aria-label', 'save task name')
        saveButton.textContent = 'שמור'
        saveButton.dataset.taskId = id
        return saveButton
    }

    blinkNewTask() {
        const firstCurrent = this.futureTasksList.firstElementChild
        const blinkInterval = setInterval(() => {
            firstCurrent.style.backgroundColor =
                firstCurrent.style.backgroundColor ===
                'rgba(196, 218, 212, 0.45)'
                    ? 'transparent'
                    : 'rgb(196, 218, 212, 0.45)'
        }, 800)
        setTimeout(() => {
            clearInterval(blinkInterval)
            firstCurrent.style.backgroundColor = 'transparent' // Ensure it ends visible
        }, 5000)
    }

    createStatusElement(id, status) {
        const statusElement = this.createElementWithClass(
            'span',
            `status-state ${status}`
        )
        statusElement.id = `work-item-status_${id}`

        statusElement.textContent =
            status === 'waiting' ? 'ממתין לביצוע' : 'בוצע'
        return statusElement
    }

    createDescriptionElement(desc) {
        const descElement = this.createElementWithClass('span', '')
        descElement.id = 'new-item-desc'
        descElement.textContent = desc
        return descElement
    }

    createHourElement(hour) {
        const hourElement = this.createElementWithClass('span', '')
        hourElement.id = 'work-item-hour'
        hourElement.textContent = hour
        return hourElement
    }

    createActionButtons(id, status) {
        const actionButtons = this.createElementWithClass(
            'span',
            'actions-buttons'
        )

        // Status button
        const statusButton = this.createElementWithClass(
            'button',
            `status-button ${status === 'waiting' ? 'change-to-done' : 'change-to-waiting'}`
        )
        statusButton.id = 'change-to-done'
        statusButton.setAttribute('aria-label', id)
        statusButton.textContent =
            status === 'waiting' ? 'סמן כבוצע' : 'שנה סטטוס'
        statusButton.dataset.taskId = id

        // Delete button
        const deleteButton = this.createElementWithClass('button', '')
        deleteButton.id = 'work-item-delete'
        deleteButton.textContent = 'מחיקה'
        deleteButton.dataset.taskId = id

        // Assemble
        actionButtons.appendChild(statusButton)
        actionButtons.appendChild(deleteButton)

        return actionButtons
    }

    createDescriptionSection(description, id) {
        const itemDescContainer = this.createElementWithClass(
            'div',
            'task-description-container'
        )

        // Create editable paragraph
        const newItemDesc = this.createElementWithClass('p', 'editable-para')
        newItemDesc.id = 'work-item-description'
        newItemDesc.textContent = description
        newItemDesc.setAttribute('aria-label', 'item-description')

        // Create edit icon
        const editDescription = document.createElement('img')
        editDescription.src = editIcon
        editDescription.style.display = 'none'
        editDescription.className = 'edit-icon'
        itemDescContainer.appendChild(editDescription)

        // Create edit actions container
        const editActionsContainer = this.createElementWithClass(
            'div',
            'edit-actions'
        )
        editActionsContainer.appendChild(
            this.createSaveDescriptionButton(
                newItemDesc,
                editActionsContainer,
                id,
                editDescription
            )
        )

        // Assemble
        itemDescContainer.appendChild(newItemDesc)
        itemDescContainer.appendChild(editActionsContainer)

        return {
            itemDescContainer,
            newItemDesc,
            editActionsContainer,
            editDescription,
        }
    }

    createSaveDescriptionButton(itemDesc, actionsContainer, id, edit) {
        const saveButton = this.createElementWithClass('button', 'save-button')
        saveButton.setAttribute('aria-label', 'save task description')
        saveButton.textContent = 'שמור'
        saveButton.dataset.taskId = id
        return saveButton
    }

    createCancelDescriptionButton(
        itemDesc,
        actionsContainer,
        description,
        id,
        edit
    ) {
        const cancelButton = this.createElementWithClass(
            'button',
            'cancel-button'
        )
        cancelButton.setAttribute('aria-label', 'cancel task description')
        cancelButton.textContent = 'ביטול'
        cancelButton.dataset.taskId = id
        cancelButton.dataset.originalDescription = description
        return cancelButton
    }
}
