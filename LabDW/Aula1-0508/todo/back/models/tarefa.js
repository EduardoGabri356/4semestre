// aqui nós estamos criando a model de uma tarefa no nosso To-Do
import { Schema } from "mongoose";
import mongoose from "../db/conn.js";
const { Schema } = mongoose;
const tarefaSchema = new Schema({
        titulo:{
            type: String,
            require: true,
        },
        descricao:({
            type: String,
            require: true,
        }),
        dataLimite:({
            type: Date,
            required: true,
        }),
        situacao:({
            type: String,
            required: true,
        })
    },{timestamp: true}
);
const tarefa = mongoose.model('Task', tarefaSchema);
export default tarefa