// ==================== API/Api.jsx — CLIENTE HTTP ÚNICO ====================
// Todas as chamadas ao backend ficam aqui. Se a URL mudar, altere só baseURL.

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/App",
  withCredentials: true,                 // envia/recebe o cookie do JWT
  headers: { "Content-Type": "application/json" },
});

// mensagem de erro vinda do backend ({ message }) ou do axios
export const msgErro = (e) => e.response?.data?.message || e.message || "Erro inesperado";

// ----- Item -----
export const getItens = (params) => api.get("/item/getAll", { params }); // params -> ?busca=..&situacao=..
export const getItemById = (id) => api.get(`/item/getById/${id}`);
export const createItem = (payload) => api.post("/item/create", payload);
export const updateItem = (id, payload) => api.put(`/item/update/${id}`, payload);
export const updateSituacaoItem = (id, situacao) => api.patch(`/item/updateSituacao/${id}`, { situacao });
export const deleteItem = (id) => api.delete(`/item/delete/${id}`);
export const getResumoItens = () => api.get("/item/resumo");

// ----- Usuário / autenticação -----
export const createUser = (payload) => api.post("/createUsuario", payload);
export const login = (payload) => api.post("/login", payload);
export const logout = () => api.post("/logout");
export const getProfile = () => api.get("/me");
export const getUsers = () => api.get("/getAllUsers");
export const forgot = (payload) => api.post("/forgotPassword", payload);
export const reset = (payload) => api.post("/resetPassword", payload);

// ----- Chat -----
export const getHistory = (itemId) => api.get(`/getHistory/${itemId}`);

export default api;
