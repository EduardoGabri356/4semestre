db = db.getSiblingDB('prontaComanda');

db.usuarios.insertOne({
_id: ObjectId('segredo'),
nome: "DevEduardo",
cpf: "10011001011",
perfil: "administrador",
ativo: true,
});