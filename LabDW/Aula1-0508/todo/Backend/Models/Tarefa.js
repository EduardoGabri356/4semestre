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
    participam:[{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    }],
    situacao:{
        type:String,
        enum: ["Pendente", "Finalizada", "Cancelada"],
        default: "Pendente",
    }
},{timestamps:true});
const Tarefa = mongoose.model('Tarefa', tarefaSchema);
export default Tarefa;
