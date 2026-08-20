import axios from "axios";
const API = axios.create({
    baseURL: "http://localhost:5000/todo",
    headers: {
        "Content-Type": "application/json"
    }
})

export const getToDo=()=>API.get("/getAll")
export const create=()=>API.post("/create")
export default API;