import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import dotenv from "dotenv";
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({
    connectionString
});

const prisma = new PrismaClient({ adapter });

const Decimal = Prisma.Decimal;

export { prisma, PrismaClient, Prisma, Decimal };
export * from "../generated/prisma/client";
export * from "../generated/prisma/enums";