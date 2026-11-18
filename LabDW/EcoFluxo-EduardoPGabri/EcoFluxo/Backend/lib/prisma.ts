import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

//Prisma 7 exige um driver adapter para conectar ao banco (MySQL usa o adapter mariadb)
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });
export default prisma;