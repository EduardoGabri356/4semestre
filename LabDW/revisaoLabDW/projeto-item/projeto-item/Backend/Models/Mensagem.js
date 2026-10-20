// ==================== Model Mensagem — histórico do chat de cada Item ====================

import mongoose from "../db/conn.js";
const { Schema } = mongoose;

const mensagemSchema = new Schema({
    item:      { type: Schema.Types.ObjectId, ref: "Item", required: true },
    remetente: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    texto:     { type: String, required: true, trim: true },
    lidaPor:   [{ type: Schema.Types.ObjectId, ref: "Usuario" }]
}, { timestamps: true });

const Mensagem = mongoose.model("Mensagem", mensagemSchema);
export default Mensagem;
