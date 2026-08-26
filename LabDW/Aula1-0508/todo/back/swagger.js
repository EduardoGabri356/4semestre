import swaggerAutogen from "swagger-autogen";
const doc = {
    info:{
        title: "API ToDo List",
        description: "Documentação para a geração automatica dos testes"
    },
    host: 'localhost:5000',
    basePatch: '/ToDo',
}
// nome do arquivo que sera criado automaticamente
const outputfile = './swagger-output.json'; 

// caminho para as rotas
const endPointFiles = [
    './Routes/routesUsuario.js',
    './Routes/routesTarefa.js'
];

swaggerAutogen()( outputfile, endPointFiles, doc )