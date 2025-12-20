import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const adminId = 'user_2725b19c-f0cc-4ad1-bf10-35128961530a' // Dummy but helps

    // 1. Settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: { taxRate: 15 },
        create: {
            id: 'default',
            businessName: 'Test Business',
            currency: 'USD',
            taxRate: 15
        }
    })

    // 2. Warehouse
    const warehouse = await prisma.warehouse.create({
        data: {
            name: 'Main Store',
            location: 'Downtown'
        }
    })

    // 3. Category
    const category = await prisma.category.create({
        data: { name: 'Electronics' }
    })

    // 4. Product
    const product = await prisma.product.create({
        data: {
            name: 'Wireless Mouse',
            sku: 'm-101',
            barcode: '123456789',
            unit: 'pcs',
            costPrice: 10,
            sellingPrice: 25,
            categoryId: category.id,
            reorderLevel: 5
        }
    })

    // 5. Stock
    await prisma.stockLedger.create({
        data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantityChange: 100,
            type: 'PURCHASE',
            userId: adminId,
            note: 'Initial Stock'
        }
    })

    // 6. Account
    await prisma.account.create({
        data: {
            name: 'Cash Account',
            type: 'CASH',
            balance: 1000
        }
    })

    console.log('Seeding complete!')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
