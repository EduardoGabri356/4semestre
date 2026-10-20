// ==================== Model Usuario ====================
// Model = molde dos documentos de uma coleção do MongoDB (formato + validações).
// Collection criada automaticamente: "usuarios".

import mongoose from "../db/conn.js";
// Schema descreve os campos; required/unique/trim/lowercase são validações e normalizações.
const {Schema} = mongoose;
const usuarioSchema = new Schema({
    nome:{
        type: String,
        required: true,
        trim: true
    },
    // unique:true cria um índice único: e-mail repetido gera o erro 11000 (tratado no Controller).
    email:{
        type:String,
        required: true,
        unique: true,
        trim:true,
        lowercase:true
    },
    // select:false = o campo NÃO vem nas consultas (find/findOne/findById).
    // Para trazê-lo é preciso pedir: .select("+senha") (feito só no Login).
    // Obs.: só vale para consultas; o retorno de save() ainda contém o campo.
    senha:{
        type:String,
        required:true,
        select:false
    },
    // Campos usados na recuperação de senha. O token é guardado como HASH e tem validade.
    resetToken:{
        type:String,
        select:false,
    },
    resetTokenExpiry:{
        type:Date,
        select:false,
    }
// timestamps:true cria e mantém createdAt e updatedAt sozinho.
},{timestamps:true});
// mongoose.model("Usuario", schema) -> coleção "usuarios" no banco.
const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;