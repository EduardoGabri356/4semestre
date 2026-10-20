// ==================== db/conn.js — CONEXÃO COM O MONGODB ====================
// Os Models importam o "mongoose" deste arquivo, então a conexão abre sozinha no primeiro import.

import mongoose from "mongoose";
async function main() {
    const databaseUrl = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/MeuBanco";
    await mongoose.connect(databaseUrl);
    console.log("Conectou MongoDb");
}
main().catch((err) => console.log(err));
export default mongoose;
