import { eventHandler, storage } from '..'

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

    newWorkItem(name, desc, hour, id, status) {
        const newWorkItem = document.createElement('div')
        newWorkItem.className = 'work-item'
        const newItemName = document.createElement('span')
        newItemName.id = 'work-item-name'
        newItemName.innerHTML = name
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
            console.log('delete')
            eventHandler.deleteTask(id)
        })
        eventHandler.statusContainer =
            document.getElementById('work-item-status')

        actionButtons.appendChild(statusButton)
        actionButtons.appendChild(deleteButton)
        newWorkItem.appendChild(newItemName)
        newWorkItem.appendChild(newItemStatus)
        newWorkItem.appendChild(newItemDesc)
        newWorkItem.appendChild(newItemHour)
        newWorkItem.appendChild(actionButtons)

        this.workItemList.appendChild(newWorkItem)
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
    }
}
