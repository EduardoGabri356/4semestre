db = db.getSiblingDB('meubanco');
db.usuarios.insertOne({
  nome: "Seu Nome",
  email: "seu@email.com"
});