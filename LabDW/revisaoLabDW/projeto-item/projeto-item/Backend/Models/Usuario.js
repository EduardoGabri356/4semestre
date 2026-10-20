// ==================== Model Usuario ====================
// senha e tokens de reset têm select:false: não vêm nas consultas, a menos que se peça com .select("+campo").

import mongoose from "../db/conn.js";
const { Schema } = mongoose;

const usuarioSchema = new Schema({
    nome:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, trim: true, lowercase: true },
    senha:  { type: String, required: true, select: false },           // não vem nos find()
    perfil: { type: String, enum: ["user", "admin"], default: "user" }, // (opcional) controle de acesso
    resetToken:       { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false }
}, { timestamps: true });

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
