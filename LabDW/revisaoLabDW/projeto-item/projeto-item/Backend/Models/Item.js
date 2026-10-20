// ==================== Model Item — ENTIDADE PRINCIPAL ====================
// Troque os campos pelos do enunciado. Relaciona-se com Usuario (dono e participam).

import mongoose from "../db/conn.js";
const { Schema } = mongoose;

const itemSchema = new Schema({
    titulo:     { type: String, required: true, trim: true },
    descricao:  { type: String, required: true },
    dataLimite: { type: Date, required: true },
    situacao:   { type: String, enum: ["Pendente", "Finalizada", "Cancelada"], default: "Pendente" },
    dono:       { type: Schema.Types.ObjectId, ref: "Usuario", required: true },   // 1:N
    participam: [{ type: Schema.Types.ObjectId, ref: "Usuario" }]                  // N:N
}, { timestamps: true });                                                          // createdAt/updatedAt

const Item = mongoose.model("Item", itemSchema);
export default Item;
