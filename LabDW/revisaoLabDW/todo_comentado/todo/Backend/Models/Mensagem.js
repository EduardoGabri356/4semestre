// ==================== Model Mensagem (chat de cada tarefa) ====================
// Guarda cada mensagem enviada pelo Socket para o histórico (GET /getHistory/:tarefaId).

import mongoose from "../db/conn.js";
const {Schema} = mongoose;
const mensagemSchema = new Schema({
    // A qual tarefa (sala de chat) a mensagem pertence.
    tarefa:{
        type: Schema.Types.ObjectId,
        ref: "Tarefa",
        required: true
    },
    // Quem enviou (ref Usuario). No histórico é trocado pelo usuário via populate.
    remetente:{
        type:Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
    },
    texto:{
        type: String,
        required:true,
        trim: true
    },
    // Lista de usuários que já leram (campo preparado; o código ainda não o utiliza).
    lidaPor:[{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    }]
},{timestamps:true});
const Mensagem = mongoose.model('Mensagem', mensagemSchema);
export default Mensagem;