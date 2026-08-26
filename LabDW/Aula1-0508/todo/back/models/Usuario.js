import mongoose from "../db/conn.js";
const { Schema } = mongoose;

const usuarioSchema = new Schema({
        nome: {
            type: String,
            required: true,
            trimm: true // tira espaçoes da frente e de trás
        },
        email: {
            type: String,
            required: true,
            unique: true, // só pode existir um
            trimm: true,
            lowercase: true, // grafia comum, fica tudo igual no banco
        },
        senha: {
            type: String,
            required: true,
            trimm: true,
            select: false // Toda consulta que for feita no banco, ele não manda a senha junto da consulta
        },
        resetToken: {
            type: String,
            select: false,
        },
        resetTokenExpire: {
            type: Date,
            select: false,
        }
    },
    { timestamps: true }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;