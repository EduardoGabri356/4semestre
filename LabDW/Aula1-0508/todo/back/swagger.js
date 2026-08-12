import swaggerAutogen from "swagger-autogen";
const doc = {
    info:{
        title: "API ToDo List",
        description: "Documentação para a geração automatica dos testes"
    },
    host: 'localhost:5000',
    basePatch: '/ToDo',
}
// 
const outputfile = './swagger-output.json' 
const routefile = ['./Routes/routes.js']

// caminho para as rotas
swaggerAutogen()( outputfile, routefile, doc )