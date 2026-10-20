// ==================== Model Tarefa ====================
// Representa uma tarefa. Relaciona-se com Usuario (participantes) e é referenciada por Mensagem.

import mongoose from "../db/conn.js";
const {Schema} = mongoose;
const tarefaSchema = new Schema({
    titulo:{
        type: String,
        required: true,
    },
    descricao:{
        type:String,
        required: true,
    },
    dataLimite:{
        type:Date,
        required:true,
    },
    // Relacionamento com outra coleção: lista de ObjectId de Usuario.
    // Com .populate("participam") o Mongoose troca os ids pelos documentos (JOIN).
    participam:[{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    }],
    // enum = só aceita esses valores. default = valor quando nada é informado.
    // Regra de negócio no TarefaController: só "Pendente" pode virar Finalizada/Cancelada.
    situacao:{
        type:String,
        enum: ["Pendente", "Finalizada", "Cancelada"],
        default: "Pendente",
    }
},{timestamps:true});
const Tarefa = mongoose.model('Tarefa', tarefaSchema);
export default Tarefa;
