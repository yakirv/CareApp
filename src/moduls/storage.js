export class Storage {
    constructor() {
        const storedArray = localStorage.getItem('tasksList')
        let listArray = []
        this.addNewProject()
    }
    storageAvailable(type) {
        let storage
        try {
            storage = window[type]
            const x = 'storage_Test'
            storage.setItem('storage_key', x)
            storage.removeItem('storage_key')
            return true
        } catch (e) {
            return (
                e instanceof DOMException &&
                e.name === 'QuotaExceededError' &&
                storage &&
                storage.length !== 0
            )
        }
    }

    addNewProject() {
        if (this.storageAvailable('localStorage')) {
            this.storedArray = localStorage.getItem('tasksList')
            this.listArray = []
            if (this.storedArray) {
                try {
                    this.listArray = JSON.parse(this.storedArray)
                } catch (error) {
                    console.error(
                        'Error parsing data from localStorage:',
                        error
                    )
                    this.listArray = []
                }
            }
        }
    }
    storeTasks(taksName, taskDesc, taskhour, status = 'waiting') {
        if (this.storageAvailable('localStorage')) {
            const currentDate = new Date()
            const taskDate = new Date(taskhour)

            // Determine which list to use based on the task date
            const listKey =
                taskDate > currentDate ? 'futureTasksList' : 'tasksList'

            let storedTasks = localStorage.getItem(listKey)

            if (storedTasks === null) {
                localStorage.setItem(listKey, '[]')
                storedTasks = localStorage.getItem(listKey)
            }
            let tasksArray = JSON.parse(storedTasks)
            tasksArray.push({
                name: taksName,
                desc: taskDesc,
                id: this.generateRandomId(),
                hour: taskhour,
                status: status,
            })
            if (listKey === 'futureTasksList') {
                tasksArray = this.sortTasksByDate(tasksArray, true)
            } else {
                tasksArray = this.sortTasksByDate(tasksArray)
            }

            const updatedDataString = JSON.stringify(tasksArray)
            localStorage.setItem(listKey, updatedDataString)
        }
    }
    generateRandomId() {
        const id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        return id
    }

    calculateTimePassed(taskDate) {
        const current = new Date()
        taskDate = new Date(taskDate)
        if (taskDate < current) {
            const diffMs = current - new Date(taskDate)

            const seconds = Math.floor(diffMs / 1000)
            const minutes = Math.floor(seconds / 60)
            const hours = Math.floor(minutes / 60)
            const days = Math.floor(hours / 24)

            if (days > 0) {
                return ['days', days]
            } else if (hours > 0) {
                return ['hours', hours]
            } else if (minutes > 0) {
                return ['minutes', minutes]
            } else {
                return ['seconds', seconds]
            }
        } else {
            return [taskDate, '']
        }
    }
    formatDate(date) {
        const d = date ? date : new Date()

        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
        const year = d.getFullYear()
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')

        // Return the formatted date string
        return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    deleteTaskFromStorage(arr, idToRemove) {
        return arr.filter((obj) => obj.id !== idToRemove)
    }
    sortTasksByDate(
        array = this.listArray,
        ascending = false,
        dateKey = 'hour'
    ) {
        return array.slice().sort((a, b) => {
            const dateA = new Date(a[dateKey])
            const dateB = new Date(b[dateKey])

            if (ascending) {
                return dateA - dateB
            } else {
                return dateB - dateA
            }
        })
    }

    editTaskName(id, name, key) {
        const taskArray = JSON.parse(this.storedArray)
        taskArray.forEach((task) => {
            if (task.id === id) {
                if (key === 'taskName') {
                    task.name = name
                }
                if (key === 'descName') {
                    task.desc = name
                }

                const updatedDataString = JSON.stringify(taskArray)
                localStorage.setItem('tasksList', updatedDataString)
            }
        })
    }
}
