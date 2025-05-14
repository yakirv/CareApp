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
            /*   listArray.push({ name: taksName, desc: taskDesc })
            const updatedDataString = JSON.stringify(listArray)
            localStorage.setItem('tasksList', updatedDataString) */
        }
    }
    storeTasks(taksName, taskDesc) {
        if (this.storageAvailable('localStorage')) {
            this.listArray.push({ name: taksName, desc: taskDesc })
            const updatedDataString = JSON.stringify(this.listArray)
            localStorage.setItem('tasksList', updatedDataString)
        } else {
            // Too bad, no localStorage for us
        }
    }

    sortTasksByDate(array, dateKey, ascending = true) {
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
