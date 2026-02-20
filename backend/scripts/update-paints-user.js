const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const targetUserId = 'e0469254-1011-4a74-87c6-ad394a3f3dd8'
  
  console.log('Updating paints to user_id:', targetUserId)
  
  // Update all paints to the target user
  const result = await prisma.paint.updateMany({
    data: {
      userId: targetUserId
    }
  })
  
  console.log('Updated', result.count, 'paints')
  
  // Verify the update
  const paints = await prisma.paint.findMany({
    where: { userId: targetUserId },
    take: 5,
    select: {
      id: true,
      brand: true,
      name: true,
      userId: true
    }
  })
  
  console.log('\nSample paints:')
  paints.forEach(p => {
    console.log(`- ${p.brand} ${p.name} (user: ${p.userId})`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
