import axios from "axios";
const API = axios.create({
    baseUrl: "http:localhost:5000/ToDo",
    headers: {
        "Content-Type": "application.json"
    }
})

export const getToDo=()=>API.get("/getAll")
export const Create=()=>API.post("/create")
export default API;