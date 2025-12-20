import { PrismaClient } from './src/generated/prisma'
const prisma = new PrismaClient()

async function main() {
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Sale'
    `
        console.log('Columns in Sale table:', JSON.stringify(columns, null, 2))

    } catch (err) {
        console.error('Error during verification:', err)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
