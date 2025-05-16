import { eventHandler, storage } from '..'

export class UI {
    workItemList
    menuIcon
    actions

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.workItemList = document.querySelector('.work-item-list')
            this.menuIcon = document.getElementById('menu-icon')
            this.actions = document.getElementById('actions')
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
            for (let i = 0; i < storedString.length; i++) {
                this.newWorkItem(
                    storedString[i].name,
                    storedString[i].desc,
                    storage.calculateDate(storedString[i].hour),
                    storedString[i].id,
                    storedString[i].status
                )

                eventHandler.statusContainer =
                    document.getElementById('work-item-status')
            }
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
        newItemStatus.className = status
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
        const newItemAction = document.createElement('button')
        newItemAction.id = 'work-item-action'
        newItemAction.innerHTML = 'סמן כבוצע'
        newItemAction.addEventListener('click', () => {
            eventHandler.changeTaskStatus(id)
        })

        eventHandler.statusContainer =
            document.getElementById('work-item-status')

        newWorkItem.appendChild(newItemName)
        newWorkItem.appendChild(newItemStatus)
        newWorkItem.appendChild(newItemDesc)
        newWorkItem.appendChild(newItemHour)
        newWorkItem.appendChild(newItemAction)

        this.workItemList.appendChild(newWorkItem)
    }

    updateStatusInd(id) {
        const item = document.getElementById(`work-item-status_${id}`)
        if (item.className === 'waiting') {
            item.className = 'done'
            item.innerHTML = 'בוצע'
        } else if (item.className === 'done') {
            item.className = 'waiting'
            item.innerHTML = 'ממתין לביצוע'
        }
    }
}
