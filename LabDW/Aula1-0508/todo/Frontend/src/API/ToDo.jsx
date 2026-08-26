import axios from "axios";
const API = axios.create({
    baseURL: "http://localhost:5000/todo",
    headers: {
        "Content-Type": "application/json"
    }
})

export const getToDo=()=>API.get("/getAll")
export const create = (titulo, descricao, dataLimite, situacao) =>
    API.post("/create", { titulo, descricao, dataLimite, situacao });
export default API;