// ==================== swagger.js — GERA A DOCUMENTAÇÃO ====================
// "npm run swagger" lê os arquivos de rotas e grava swagger-output.json (exibido em /docs).

import swaggerAutogen from "swagger-autogen";

const doc = {
    info: { title: "API do Projeto", description: "Documentação gerada automaticamente" },
    host: "localhost:5000",
    basePath: "/App"
};
const outputFile = "./swagger-output.json";
// TODOS os arquivos de rotas (se esquecer um, ele não aparece no /docs)
const endpointsFiles = ["./Routes/routesUsuario.js", "./Routes/routesItem.js", "./Routes/routesChat.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
