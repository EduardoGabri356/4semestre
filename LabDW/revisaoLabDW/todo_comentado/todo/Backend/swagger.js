// ==================== swagger.js — GERADOR DA DOCUMENTAÇÃO ====================
// Roda com "npm run swagger": lê os arquivos de rotas e grava o swagger-output.json.
// O index.js carrega esse JSON e o exibe em http://localhost:5000/docs.
// Rode de novo sempre que criar/alterar rotas.

import swaggerAutogen from "swagger-autogen";
// Cabeçalho da documentação (título, host e basePath = prefixo /ToDo).
const doc = {
    info:{
        title: 'API ToDo List',
        description: 'Documentação para a geração automática dos testes'
    },
    host: 'localhost:5000',
    basePath: '/ToDo',
}
//nome do arquivo que será gerado automaticamente
const outputFile = './swagger-output.json';
//caminho para as rotas
// Arquivos analisados. NOTA: routesChat.js não está aqui; adicione para o /getHistory aparecer.
const endpointsFiles = [
  './Routes/routesUsuario.js',
  './Routes/routesTarefa.js'
];
// Gera o arquivo de saída a partir das rotas.
swaggerAutogen()(outputFile, endpointsFiles, doc);