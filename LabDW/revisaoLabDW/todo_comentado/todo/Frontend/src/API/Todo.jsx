// ==================== API/Todo.jsx — CLIENTE HTTP ÚNICO ====================
// Todas as chamadas ao backend ficam aqui; as telas só importam funções nomeadas.
// Se a URL do backend mudar, altere apenas baseURL.
// Cada função devolve uma Promise do axios (use await). Dados em resposta.data.

import axios from "axios";
// baseURL = prefixo comum. withCredentials:true faz o navegador enviar/receber o cookie do JWT
// (exige cors credentials:true no backend).
const api = axios.create({
    baseURL:"http://localhost:5000/ToDo",
    withCredentials: true, // Permite o envio de cookies e sessões
    headers:{
        "Content-Type": "application/json"
    }
})
// GET /getAll -> TarefaController.getAll (usada em TodoList)
export const  getTodos=()=>api.get("/getAll");
// POST /create -> TarefaController.Create (usada em TodoForm)
export const  createTodo=(payload)=>api.post("/create", payload);
// PATCH /updateSituacao/:id (usada em TodoItem). Template string insere o id na URL.
export const  updateSituacao=(id, situacao)=>api.patch(`/updateSituacao/${id}`, { situacao });
// GET /getHistory/:tarefaId (usada em TodoChatModal)
export const  getChatTodoHistory=(tarefaId)=>api.get(`/getHistory/${tarefaId}`);
// GET /getAllUsers (usada em TodoForm)
export const  getUsers=()=>api.get("/getAllUsers");
// POST /createUsuario (usada em Cadastro)
export const  createUser=(payload)=>api.post("/createUsuario", payload);
// POST /login (usada em Login)
export const  login=(payload)=>api.post("/login", payload);
// POST /logout (usada em App)
export const  logout=()=>api.post("/logout");
// POST /resetPassword (usada em ResetPassword)
export const  reset=(payload)=>api.post("/resetPassword", payload);
// POST /forgotPassword (usada em ForgotPassword)
export const  forgot=(payload)=>api.post("/forgotPassword", payload);
// GET /me (usada em App.checkUserSession)
export const  getProfile = () => api.get("/me");

export default api;
