# Projeto Item — modelo de CRUD completo (Node + Express + MongoDB + React)

Aplicação simples e comentada, no mesmo padrão do projeto ToDo. Serve de molde para a prova:
troque a entidade **Item** pela do enunciado e ajuste os campos.

## Estrutura

```
projeto-item/
├── Backend/                      (porta 5000)
│   ├── index.js                  entrada: Express + Socket.IO + Swagger + rotas
│   ├── swagger.js                gerador da documentação (npm run swagger)
│   ├── .env                      variáveis de ambiente (ajuste antes de rodar)
│   ├── db/conn.js                conexão com o MongoDB
│   ├── Models/                   Item, Usuario, Mensagem
│   ├── Controllers/              ItemController (CRUD), UsuarioController (auth), ChatController
│   ├── Routes/                   routesItem, routesUsuario, routesChat
│   ├── Middleware/               UserMiddleware (JWT em cookie)
│   ├── Services/                 EmailService (nodemailer)
│   └── Socket/                   registerChatSocket (eventos do chat)
└── Frontend/                     (porta 5173)
    └── src/
        ├── main.jsx · App.jsx    entrada, sessão e rotas
        ├── API/Api.jsx           cliente axios único
        ├── Pages/                Login, Cadastro, ForgotPassword, ResetPassword, ItemList, ItemForm
        ├── Components/           ItemCard, GraficoSituacao, ChatModal
        └── Hooks/                useVoiceRecognition, useFetch
```

## Como rodar

Pré-requisitos: Node.js 20.19+ (ou 22 LTS) e MongoDB rodando em `127.0.0.1:27017`.

```bash
# 1) Backend
cd Backend
npm install
# edite o .env (principalmente JWT_SECRET; EMAIL_* só para "esqueci a senha")
npm run swagger        # gera o swagger-output.json (rode de novo quando mudar rotas)
npm start              # http://localhost:5000  |  docs em http://localhost:5000/docs

# 2) Frontend (outro terminal)
cd Frontend
npm install
npm run dev            # http://localhost:5173  (use "localhost", não 127.0.0.1)
```

Teste: abra `http://localhost:5173`, clique em "Criar conta", entre, crie um item, edite, finalize, exclua e abra o chat.

## Como adaptar para outro enunciado (ex.: Produto)

No VS Code, `Ctrl+Shift+H` (substituir em todos os arquivos) com **Match Case**, nesta ordem:

| Trocar | Por |
| --- | --- |
| `Itens` | `Produtos` |
| `itens` | `produtos` |
| `Item` | `Produto` |
| `item` | `produto` |
| `/App` | `/Loja` |

Depois renomeie os arquivos que têm "Item" no nome e ajuste os campos em: `Models/Item.js`, `ItemController.js`
(métodos `Create` e `Update`), `ItemForm.jsx`, `ItemCard.jsx` e `ItemList.jsx`.
Rode `npm run swagger` outra vez.

## Mapa: onde está cada conceito

| Conceito | Arquivo |
| --- | --- |
| Criar / listar / editar / excluir | `Backend/Controllers/ItemController.js` + `Routes/routesItem.js` |
| Regra de estado (só Pendente muda) | `ItemController.updateSituacao` |
| Filtros, busca, paginação, `populate` | `ItemController.getAll` |
| Agregação para gráfico | `ItemController.Resumo` |
| Cadastro, login (JWT em cookie), logout | `UsuarioController.js` |
| Esqueci / redefinir senha por e-mail | `UsuarioController.js` + `Services/EmailService.js` |
| Rota privada | `Middleware/UserMiddleware.js` |
| Chat em tempo real | `Socket/registerChatSocket.js` + `ChatController.js` + `Components/ChatModal.jsx` |
| Swagger | `swagger.js` |
| Sessão e rotas protegidas no front | `Frontend/src/App.jsx` |
| Formulário de criar e editar | `Pages/ItemForm.jsx` |
| Gráfico | `Components/GraficoSituacao.jsx` |
| Voz | `Hooks/useVoiceRecognition.js` |

## Problemas comuns

- `Cannot find module './swagger-output.json'`: rode `npm run swagger` (já vem um arquivo mínimo, mas gere o completo).
- Erro de CORS ou cookie não grava: acesse por `http://localhost:5173` e confira `FRONTEND_URL` no `.env`.
- `MongooseServerSelectionError`: o MongoDB não está rodando.
- `npm install` falha no `argon2`: use `@node-rs/argon2` (troque o import em `UsuarioController.js` por `import { hash, verify } from "@node-rs/argon2"` e as chamadas `argon2.hash`/`argon2.verify` por `hash`/`verify`).
- Botão de voz ausente: só funciona no Chrome/Edge.
