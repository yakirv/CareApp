import { apiServices } from '..'

export class Helpers {
    getFirebaseUidFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const DB_NAME = 'firebaseLocalStorageDb'
            const OBJECT_STORE_NAME = 'firebaseLocalStorage'

            // Request to open the database
            const request = indexedDB.open(DB_NAME)

            request.onerror = (event) => {
                console.error(
                    'Error opening Firebase IndexedDB:',
                    event.target.errorCode
                )
                reject(new Error('Could not open Firebase IndexedDB.'))
            }

            request.onsuccess = (event) => {
                const db = event.target.result

                if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
                    db.close()
                    resolve(null) // Object store doesn't exist, likely no Firebase data
                    return
                }

                // Start a read-only transaction on the 'firebaseLocalStorage' object store
                const transaction = db.transaction(
                    [OBJECT_STORE_NAME],
                    'readonly'
                )
                const objectStore = transaction.objectStore(OBJECT_STORE_NAME)

                // Use a cursor to iterate through records, looking for the auth user data
                const cursorRequest = objectStore.openCursor()
                let uid = null

                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result
                    if (cursor) {
                        // Check if the key matches the pattern for Firebase auth user
                        // The key often looks like "firebase:authUser:apiKey:[DEFAULT]"
                        if (
                            typeof cursor.key === 'string' &&
                            cursor.key.startsWith('firebase:authUser:')
                        ) {
                            const authData = cursor.value
                            // The UID is typically nested within the 'stsTokenManager' object
                            if (authData) {
                                //uid = authData.stsTokenManager.uid
                                uid = authData.value.uid
                                cursor.continue() // Found it, no need to continue
                            }
                        }
                        if (!uid) {
                            // Continue if UID not found yet
                            cursor.continue()
                        }
                    }
                }

                cursorRequest.onerror = (event) => {
                    console.error(
                        'Error reading from firebaseLocalStorage:',
                        event.target.error
                    )
                    reject(new Error('Error reading Firebase auth data.'))
                }

                transaction.oncomplete = () => {
                    db.close()
                    resolve(uid)
                }

                transaction.onerror = (event) => {
                    console.error(
                        'FirebaseLocalStorage transaction error:',
                        event.target.error
                    )
                    reject(
                        new Error('FirebaseLocalStorage transaction failed.')
                    )
                }
            }

            request.onupgradeneeded = (event) => {
                // This case shouldn't typically happen if the database already exists
                // with Firebase data, but included for completeness.
                // If the database is new or version changes, Firebase would create/update it.
                console.warn(
                    'FirebaseLocalStorage database upgrade needed. This might indicate initial setup or version change.'
                )
                const db = event.target.result
                if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
                    db.createObjectStore(OBJECT_STORE_NAME)
                }
            }
        })
    }

    ////////////////////////////////////////////////////////////////////////////
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

    inputValidation = (element) => {
        const input = document.getElementById(element)
        const validityState = input.validity
        if (validityState.valueMissing) {
            input.setCustomValidity('')
        } else if (validityState.rangeUnderflow) {
            input.setCustomValidity('We need a higher number!')
        } else if (validityState.rangeOverflow) {
            input.setCustomValidity("That's too high!")
        } else {
            input.setCustomValidity('')
        }

        const isvalid = input.validity.valid
        const errorReason = input.validityState

        if (!isvalid) {
            input.style.border = '2px solid #dc3737a2'
        }

        return { isvalid, errorReason }
    }

    blur_inputValidate = (inputElement) => {
        const input = document.getElementById(inputElement)

        input.addEventListener('blur', () => {
            let isvalid = this.inputValidation(inputElement)
            if (!isvalid.isvalid) {
                input.style.border = '2px solid #dc3737a2'
            } else {
                input.style.border = 'none'
            }
        })
    }
    focus_inputValidate = (inputElement) => {
        // const isvalid =  this.inputValidation(elem);

        const input = document.getElementById(inputElement)

        input.addEventListener('focus', function (event) {
            event.preventDefault()
            input.style.border = 'none'
        })
    }
}
