import { ui } from '..'
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
                //  ui.newWorkItem(taskName, taskDesc, storage.calculateDate(hour))
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

    changeTaskStatus(id) {
        const storedArray = localStorage.getItem('tasksList')
        const taskArray = JSON.parse(storedArray)

        taskArray.forEach((task) => {
            if (task.id === id) {
                console.log(`The task id is: ${id}`)
                task.status = 'done'
                task.hour = new Date()
                const updatedDataString = JSON.stringify(taskArray)
                localStorage.setItem('tasksList', updatedDataString)
                this.refreshData()
            }
        })
    }
}
