import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})
export async function register({ username, email, password }) {

    try {
        const response = await api.post('http://localhost:3000/api/auth/register', {
            username, email, password
        })
        return response.data
    }
    catch (err) {
        console.log(err)
    }
}


export async function Login({ email, password }) {
    try {
        const response = await api.post('/api/auth/login', {
            email, password
        })
        return response.data
    }
    catch (err) {
        console.log(err)
    }
}


export async function logout() {
    try {
        const response = await api.post('http://localhost:3000/api/auth/logout')
        return response.data
    }
    catch (err) {
        console.log(err)
    }
}

export async function getme() {
    try {
        const response = await api.get('http://localhost:3000/api/auth/get-me')
        return response.data
    }
    catch (err) {
        console.log(err)
    }
}

