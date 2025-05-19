import { eventHandler, storage } from '..'
import editIcon from '../assets/edit_icon.png'

export class UI {
    workItemList
    menuIcon
    actions
    emptyMessage
    listHeader
    container

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.workItemList = document.querySelector('.work-item-list')
            this.menuIcon = document.getElementById('menu-icon')
            this.actions = document.getElementById('actions')
            this.emptyMessage = document.getElementById('empty-list')
            this.listHeader = document.getElementById('list-headers')
            this.container = document.querySelector('.container')

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

    renderTasksList() {
        const storedString = JSON.parse(localStorage.getItem('tasksList'))

        if (storedString) {
            this.emptyMessage.style.display = 'none'
            this.listHeader.style.display = 'flex'
            this.container.style.display = 'flex'

            for (let i = 0; i < storedString.length; i++) {
                const taskTime = this.convertHourToString(storedString[i].hour)
                this.newWorkItem(
                    storedString[i].name,
                    storedString[i].desc,
                    taskTime,
                    storedString[i].id,
                    storedString[i].status
                )

                eventHandler.statusContainer =
                    document.getElementById('work-item-status')
            }
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
        }
    }

    clearTaskList() {
        while (this.workItemList.firstChild) {
            this.workItemList.removeChild(this.workItemList.firstChild)
        }
    }
    /* 
    newWorkItem(name, desc, hour, id, status) {
        const newWorkItem = document.createElement('div')
        newWorkItem.className = 'work-item'
        ////////////////////////////////////////  ////////////////////////////////////////
        const itemNameContainer = document.createElement('div')
        itemNameContainer.className = 'task-name-container'

        const newItemName = document.createElement('p')
        newItemName.id = 'work-item-name'
        newItemName.innerHTML = name
        newItemName.className = 'editable-para'
        newItemName.ariaLabel = 'item-name'
        const edit = document.createElement('img')
        edit.src = editIcon
        edit.style.display = 'none'
        newItemName.appendChild(edit)
        newItemName.addEventListener('click', (e) => {
            eventHandler.enterEditMode(newItemName, actionsContainer, edit)
        })
        /*     newItemName.addEventListener('mouseover', () => {
            console.log('*****mouse over****')
            edit.style.display = 'block'
        }) */
    /*    newItemName.addEventListener('blur', (e) => {
            if (newItemName.contentEditable === 'true') {
                eventHandler.exitEditMode(
                    false,
                    newItemName,
                    actionsContainer,
                    name,
                    id,
                    edit
                )
                e.preventDefault()
            }
        }) 

        newItemName.addEventListener('mouseout', () => {
            edit.style.display = 'none'
        })

        newItemName.addEventListener('keydown', (e) => {
            if (newItemName.contentEditable === 'true') {
                // Escape key cancels editing
                if (e.key === 'Escape') {
                    eventHandler.exitEditMode(
                        false,
                        newItemName,
                        actionsContainer,
                        name,
                        id,
                        edit
                    )
                    e.preventDefault()
                }
                // Ctrl/Cmd + Enter saves changes
                else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    eventHandler.exitEditMode(
                        true,
                        newItemName,
                        actionsContainer,
                        newItemName.textContent,
                        id,
                        edit
                    )
                    e.preventDefault()
                }
            }
        })
        itemNameContainer.appendChild(newItemName)

        const actionsContainer = document.createElement('div')
        actionsContainer.className = 'edit-actions'
        itemNameContainer.appendChild(actionsContainer)
        const saveNameButton = document.createElement('button')
        saveNameButton.className = 'save-button'
        saveNameButton.ariaLabel = 'save task name'
        saveNameButton.innerHTML = 'שמור'
        saveNameButton.addEventListener('click', () => {
            eventHandler.exitEditMode(
                true,
                newItemName,
                actionsContainer,
                newItemName.textContent,
                id,
                edit
            )
        })
        actionsContainer.appendChild(saveNameButton)

        const cancelNameButton = document.createElement('button')
        cancelNameButton.className = 'cancel-button'
        cancelNameButton.ariaLabel = 'cancel task name'
        cancelNameButton.innerHTML = 'ביטול'
        cancelNameButton.addEventListener('click', () => {
            eventHandler.exitEditMode(
                false,
                newItemName,
                actionsContainer,
                name,
                id,
                edit
            )
        })

        actionsContainer.appendChild(cancelNameButton)
        ////////////////////////////////////////  ////////////////////////////////////////

        const newItemStatus = document.createElement('span')
        newItemStatus.id = `work-item-status_${id}`
        newItemStatus.classList.add(status)

        newItemStatus.classList.add('status-state')
        newItemStatus.classList.add('waiting')
        if (status === 'waiting') {
            newItemStatus.innerHTML = 'ממתין לביצוע'
        } else if (status === 'done') {
            newItemStatus.innerHTML = 'בוצע'
        }
        const newItemDesc = document.createElement('span')
        newItemDesc.id = 'new-item-desc'
        newItemDesc.innerHTML = desc
        const newItemHour = document.createElement('span')
        newItemHour.id = 'work-item-hour'
        newItemHour.innerHTML = hour
        const actionButtons = document.createElement('span')
        actionButtons.className = 'actions-buttons'
        const statusButton = document.createElement('button')
        statusButton.id = `change-to-done`
        statusButton.ariaLabel = id
        statusButton.classList.add(`status-button`)
        if (status === 'waiting') {
            statusButton.classList.add(`change-to-done`)
            statusButton.innerHTML = 'סמן כבוצע'
        } else {
            statusButton.classList.add(`change-to-waiting`)
            statusButton.innerHTML = 'שנה סטטוס'
        }

        statusButton.addEventListener('click', () => {
            eventHandler.changeTaskStatus(id)
        })
        const deleteButton = document.createElement('button')
        deleteButton.id = 'work-item-delete'
        deleteButton.innerHTML = 'מחיקה'
        deleteButton.addEventListener('click', () => {
            eventHandler.deleteTask(id)
        })
        eventHandler.statusContainer =
            document.getElementById('work-item-status')

        actionButtons.appendChild(statusButton)
        actionButtons.appendChild(deleteButton)
        newWorkItem.appendChild(itemNameContainer)
        newWorkItem.appendChild(newItemStatus)
        newWorkItem.appendChild(newItemDesc)
        newWorkItem.appendChild(newItemHour)
        newWorkItem.appendChild(actionButtons)

        this.workItemList.appendChild(newWorkItem)
    }
 */
    ////////
    /*
    newWorkItem(name, desc, hour, id, status) {
        // Create the main work item container and all its child elements
        const workItem = this.createWorkItemStructure(
            name,
            desc,
            hour,
            id,
            status
        )

        // Add the work item to the DOM
        this.workItemList.appendChild(workItem)

        // Now that elements are in the DOM, bind all event listeners
        this.bindWorkItemEvents(id, name)
    }

    createWorkItemStructure(name, desc, hour, id, status) {
        // Main container
        const workItem = document.createElement('div')
        workItem.className = 'work-item'

        // Task name section
        const itemNameContainer = this.createNameSection(name, id)

        // Status indicator
        const statusIndicator = this.createStatusIndicator(id, status)

        // Description element
        const descriptionElement = document.createElement('span')
        descriptionElement.id = 'new-item-desc'
        descriptionElement.innerHTML = desc

        // Hour element
        const hourElement = document.createElement('span')
        hourElement.id = 'work-item-hour'
        hourElement.innerHTML = hour

        // Action buttons
        const actionButtons = this.createActionButtons(id, status)

        // Assemble all parts
        workItem.appendChild(itemNameContainer)
        workItem.appendChild(statusIndicator)
        workItem.appendChild(descriptionElement)
        workItem.appendChild(hourElement)
        workItem.appendChild(actionButtons)

        return workItem
    }

    createNameSection(name, id) {
        // Container for name and edit controls
        const container = document.createElement('div')
        container.className = 'task-name-container'

        // Task name paragraph
        const nameElement = document.createElement('p')
        nameElement.id = 'work-item-name'
        nameElement.innerHTML = name
        nameElement.className = 'editable-para'
        nameElement.setAttribute('aria-label', 'item-name')
        nameElement.setAttribute('data-task-id', id)

        // Edit icon
        const editElement = document.createElement('img')
        editElement.src = editIcon
        editElement.className = 'edit-icon'
        editElement.style.display = 'none'
        nameElement.appendChild(editElement)

        // Edit actions container (initially hidden)
        const actionsContainer = document.createElement('div')
        actionsContainer.className = 'edit-actions'
        actionsContainer.style.display = 'none'

        // Save button
        const saveButton = document.createElement('button')
        saveButton.className = 'save-button'
        saveButton.setAttribute('aria-label', 'save task name')
        saveButton.innerHTML = 'שמור'
        saveButton.setAttribute('data-task-id', id)

        // Cancel button
        const cancelButton = document.createElement('button')
        cancelButton.className = 'cancel-button'
        cancelButton.setAttribute('aria-label', 'cancel task name')
        cancelButton.innerHTML = 'ביטול'
        cancelButton.setAttribute('data-task-id', id)

        // Assemble edit actions
        actionsContainer.appendChild(saveButton)
        actionsContainer.appendChild(cancelButton)

        // Assemble name section
        container.appendChild(nameElement)
        container.appendChild(actionsContainer)

        return container
    }

    createStatusIndicator(id, status) {
        const statusElement = document.createElement('span')
        statusElement.id = `work-item-status_${id}`
        statusElement.classList.add('status-state', status)

        statusElement.innerHTML = status === 'waiting' ? 'ממתין לביצוע' : 'בוצע'

        return statusElement
    }

    createActionButtons(id, status) {
        const actionButtons = document.createElement('span')
        actionButtons.className = 'actions-buttons'

        // Status toggle button
        const statusButton = document.createElement('button')
        statusButton.id = `change-to-done`
        statusButton.setAttribute('aria-label', id)
        statusButton.classList.add('status-button')

        if (status === 'waiting') {
            statusButton.classList.add('change-to-done')
            statusButton.innerHTML = 'סמן כבוצע'
        } else {
            statusButton.classList.add('change-to-waiting')
            statusButton.innerHTML = 'שנה סטטוס'
        }
        statusButton.setAttribute('data-task-id', id)

        // Delete button
        const deleteButton = document.createElement('button')
        deleteButton.id = 'work-item-delete'
        deleteButton.innerHTML = 'מחיקה'
        deleteButton.setAttribute('data-task-id', id)

        // Assemble action buttons
        actionButtons.appendChild(statusButton)
        actionButtons.appendChild(deleteButton)

        return actionButtons
    }
    /* 
    bindWorkItemEvents(id, originalName) {
        // Find all elements we need to attach events to
        const nameElement = document.querySelector(
            `.editable-para[data-task-id="${id}"]`
        )
        const editIcon = nameElement.querySelector('.edit-icon')
        const actionsContainer =
            nameElement.parentElement.querySelector('.edit-actions')
        const saveButton = actionsContainer.querySelector('.save-button')
        const cancelButton = actionsContainer.querySelector('.cancel-button')
        const statusButton = document.querySelector(
            `.status-button[data-task-id="${id}"]`
        )
        const deleteButton = document.querySelector(
            `#work-item-delete[data-task-id="${id}"]`
        )

        // Name element events
        nameElement.addEventListener('click', () => {
            eventHandler.enterEditMode(nameElement, actionsContainer, editIcon)
        })

        nameElement.addEventListener('mouseover', () => {
            editIcon.style.display = 'inline'
        })

        nameElement.addEventListener('mouseout', () => {
            editIcon.style.display = 'none'
        })

        nameElement.addEventListener('keydown', (e) => {
            if (nameElement.contentEditable === 'true') {
                if (e.key === 'Escape') {
                    eventHandler.exitEditMode(
                        false,
                        nameElement,
                        actionsContainer,
                        originalName,
                        id,
                        editIcon
                    )
                    e.preventDefault()
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    eventHandler.exitEditMode(
                        true,
                        nameElement,
                        actionsContainer,
                        nameElement.textContent,
                        id,
                        editIcon
                    )
                    e.preventDefault()
                }
            }
        })

        // Button events
        saveButton.addEventListener('click', () => {
            eventHandler.exitEditMode(
                true,
                nameElement,
                actionsContainer,
                nameElement.textContent,
                id,
                editIcon
            )
        })

        cancelButton.addEventListener('click', () => {
            eventHandler.exitEditMode(
                false,
                nameElement,
                actionsContainer,
                originalName,
                id,
                editIcon
            )
        })

        statusButton.addEventListener('click', () => {
            eventHandler.changeTaskStatus(id)
        })

        deleteButton.addEventListener('click', () => {
            eventHandler.deleteTask(id)
        })
    }
    updateStatusInd(id) {
        const items = Array.from(
            document.getElementsByClassName(`status-button`)
        )
        items.forEach((item) => {
            if (
                item.classList.contains('change-to-done') &&
                item.ariaLabel === id
            ) {
                item.classList.add('change-to-waiting')
                item.classList.remove('change-to-done')
            } else if (
                item.classList.contains('change-to-waiting') &&
                item.ariaLabel === id
            ) {
                item.classList.add('change-to-done')
                item.classList.remove('change-to-waiting')
            }
        })
    } */
    newWorkItem(name, desc, hour, id, status) {
        // Create main components
        const newWorkItem = this.createElementWithClass('div', 'work-item')
        const { itemNameContainer, newItemName, actionsContainer, edit } =
            this.createNameSection(name, id)
        const newItemStatus = this.createStatusElement(id, status)
        const newItemDesc = this.createDescriptionElement(desc)
        const newItemHour = this.createHourElement(hour)
        const actionButtons = this.createActionButtons(id, status)

        // Assemble components
        newWorkItem.appendChild(itemNameContainer)
        newWorkItem.appendChild(newItemStatus)
        newWorkItem.appendChild(newItemDesc)
        newWorkItem.appendChild(newItemHour)
        newWorkItem.appendChild(actionButtons)

        // Add to DOM
        this.workItemList.appendChild(newWorkItem)

        // Add event listeners separately after DOM creation
        eventHandler.attachEventListeners(
            newItemName,
            actionsContainer,
            edit,
            name,
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
        actionsContainer.appendChild(
            this.createCancelButton(
                newItemName,
                actionsContainer,
                name,
                id,
                edit
            )
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

    createCancelButton(itemName, actionsContainer, name, id, edit) {
        const cancelButton = this.createElementWithClass(
            'button',
            'cancel-button'
        )
        cancelButton.setAttribute('aria-label', 'cancel task name')
        cancelButton.textContent = 'ביטול'
        cancelButton.dataset.taskId = id
        cancelButton.dataset.originalName = name
        return cancelButton
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
}
