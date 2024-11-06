import { PrismaClient } from '@prisma/client'

const prismaClientSinglton =()=>{
    return new PrismaClient();
}

const globalforprisma = globalThis as unknown as {prisma : PrismaClient | undefined};

const prisma = globalforprisma?.prisma?? prismaClientSinglton();

if(process.env.NODE_ENV === 'development') globalforprisma.prisma = prisma;

export default prisma;
