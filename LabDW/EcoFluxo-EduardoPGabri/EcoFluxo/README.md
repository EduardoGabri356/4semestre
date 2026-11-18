Como rodar

Backend

cd Backend
npm install
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npm run db:seed
npm run dev

Frontend

cd Frontend
npm install
npm run dev

Login de teste: 
email:
gestor@ecofluxo.com 

senha:
Gestor@123. O código de 6 dígitos aparece aqui no terminal quando ele fala que enviou o código.
