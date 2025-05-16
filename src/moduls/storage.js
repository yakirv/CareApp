export class Storage {
    constructor() {
        const storedArray = localStorage.getItem('tasksList')
        let listArray = []
        this.addNewProject()
        // this.calculateDate()
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
    storeTasks(taksName, taskDesc, taskhour) {
        if (this.storageAvailable('localStorage')) {
            this.listArray.push({
                name: taksName,
                desc: taskDesc,
                id: this.generateRandomId(),
                hour: taskhour,
            })
            this.listArray = this.sortTasksByDate(this.listArray)
            const updatedDataString = JSON.stringify(this.listArray)
            localStorage.setItem('tasksList', updatedDataString)
        }
    }
    generateRandomId() {
        const id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        return id
    }

    calculateDate(taskDate) {
        const current = new Date()

        const diffMs = current - new Date(taskDate)

        const seconds = Math.floor(diffMs / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) {
            return ` לפני ${days} ימים `
        } else if (hours > 0) {
            return ` לפני ${hours} שעות `
        } else if (minutes > 0) {
            return ` לפני ${minutes} דקות `
        } else if (seconds > 1) {
            return ` לפני ${seconds} שניות `
        } else {
            return `כעת`
        }
    }
    sortTasksByDate(
        array = this.listArray,
        dateKey = 'hour',
        ascending = false
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
}
