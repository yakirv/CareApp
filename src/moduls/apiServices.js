import { initializeApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from 'firebase/auth'
import { helpers } from '..'

export class ApiServices {
    constructor() {
        this.initializeAuthObserver()
    }
    //google login
    firebaseConfig = {
        apiKey: 'AIzaSyCfPD6ZMrCr28et1hlLYOERtXT6saRtbD4',
        authDomain: 'mycareapp-466613.firebaseapp.com',
        projectId: 'mycareapp-466613',
        storageBucket: 'mycareapp-466613.firebasestorage.app',
        messagingSenderId: '537324139694',
        appId: '1:537324139694:web:8e0634571882374b6ce93f',
    }
    app = initializeApp(this.firebaseConfig)
    auth = getAuth(this.app)
    provider = new GoogleAuthProvider()

    initializeAuthObserver() {
        this.auth.onAuthStateChanged((user) => {
            const loginBtn = document.getElementById('login-btn')
            const logoutBtn = document.getElementById('logout-btn')

            if (user) {
                // User is signed in
                console.log('User is signed in:', user.email)
                if (loginBtn) loginBtn.style.display = 'none'
                if (logoutBtn) logoutBtn.style.display = 'block'
            } else {
                // User is signed out
                console.log('User is signed out')
                if (loginBtn) loginBtn.style.display = 'block'
                if (logoutBtn) logoutBtn.style.display = 'none'
            }
        })
    }

    async loginWithGoogle() {
        try {
            console.log('Starting Google login...')
            console.log('Auth object:', this.auth)
            console.log('Provider object:', this.provider)

            const result = await signInWithPopup(this.auth, this.provider)
            console.log('Login successful, result:', result)

            const idToken = await result.user.getIdToken()
            console.log('Got ID token, sending to backend...')

            const response = await fetch('http://localhost:3000/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            })

            const data = await response.json()
            console.log('Backend response:', data)

            if (data.success) {
                let user_uid = null
                // Update UI to show logged in state
                document.getElementById('login-btn').style.display = 'none'
                document.getElementById('logout-btn').style.display = 'block'
                const user = result.user
                await fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                    }),
                })
                alert(`Welcome, ${result.user.displayName}`)
                helpers
                    .getFirebaseUidFromIndexedDB()
                    .then((uid) => {
                        if (uid) {
                            user_uid = uid
                        } else {
                            console.log('UID not found')
                        }
                    })
                    .catch((error) => {
                        console.error('Failed to retrieve Firebase UID:', error)
                    })
            } else {
                alert('Authentication failed on backend')
            }
        } catch (error) {
            console.error('Login error:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)
            // Handle specific error types
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('Popup closed by user')
                return // Don't show error for user-closed popup
            }
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this website to login')
                return
            }
            // For all other errors
            alert(error.message)
        }
    }

    logout() {
        signOut(this.auth)
            .then(() => {
                console.log('User signed out successfully')
                // Clear any user data from UI
                document.getElementById('login-btn').style.display = 'block'
                document.getElementById('logout-btn').style.display = 'none'
                alert('Logged out successfully')
            })
            .catch((error) => {
                console.error('Error signing out:', error)
                alert('Error signing out: ' + error.message)
            })
    }

    // API for creating a new task
    async createTask(
        title,
        description,
        completed,
        created_at = new Date().toLocaleString('sv-SE', {
            timeZone: 'Asia/Jerusalem',
        }),
        user_id
    ) {
        try {
            const response = await fetch(`http://localhost:3000/api/tasks`, {
                method: 'POST', // Specifies this is a POST request
                headers: {
                    'Content-Type': 'application/json', // IMPORTANT: Tells the server the body is JSON
                },
                body: JSON.stringify({
                    // Converts the JS object to a JSON string
                    title: title,
                    description: description,
                    completed: completed,
                    created_at: created_at,
                    user_id: user_id, // Include the user ID in the task data
                }),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData.message}`
                )
            }

            const newTask = await response.json()
            console.log('Task created:', newTask)

            // fetchTasks()
            return newTask
        } catch (error) {
            console.error('Error creating task:', error)
        }
    }

    // API for fetching all tasks
    async fetchTasks() {
        try {
            const response = await fetch(`http://localhost:3000/api/tasks-list`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData.message}`
                )
            }

            const tasks = await response.json()
            console.log('Fetched tasks:', tasks)
            return tasks
        } catch (error) {
            console.error('Error fetching tasks:', error)
        }
    }

    //API for updating a task
    async updateTask(id, title, description, completed) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/tasks/${id}`,
                {
                    method: 'PUT', // Specifies this is a PUT request
                    headers: {
                        'Content-Type': 'application/json', // IMPORTANT: Tells the server the body is JSON
                    },
                    body: JSON.stringify({
                        // Converts the JS object to a JSON string
                        title: title,
                        description: description,
                        completed: completed,
                    }),
                }
            )
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    //API for deleting a task
    async deleteTask(id) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/tasks/${id}`,
                {
                    method: 'DELETE', // Specifies this is a DELETE request
                }
            )
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData.message}`
                )
            }
            console.log(`Task with id ${id} deleted successfully`)
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }
}
