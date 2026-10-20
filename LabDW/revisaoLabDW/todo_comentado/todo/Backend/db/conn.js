// ==================== db/conn.js — CONEXÃO COM O MONGODB ====================
// Subproblema: conectar ao banco uma única vez.
// Truque: este arquivo exporta o "mongoose"; todo Model faz import daqui,
// então a conexão é aberta automaticamente quando o primeiro Model é carregado.

import mongoose from "mongoose";
// Função assíncrona: connect() devolve uma Promise, por isso o await.
async function main(){
    //await mongoose.connect('mongodb://localhost:27017/ToDo');
    const databaseUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/ToDo';
    await mongoose.connect(databaseUrl);
    console.log("Conectou MongoDb");
}
// Executa a conexão na hora do import; se falhar, só registra o erro no console.
main().catch((err)=>{
    console.log(err);
});
// Os Models usam: import mongoose from "../db/conn.js"
export default mongoose;