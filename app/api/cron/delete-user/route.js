import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  if (process.env.CRON_SECRET &&
    process.env.CRON_SECRET !== require('next/headers').headers().get('authorization')?.split(' ')[1]) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        markedForDeletion: true,
        deletionScheduledAt: { lte: new Date() }
      }
    })

    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: usersToDelete.map(u => u.id) } }
    })

    return NextResponse.json({
      deletedCount: deleteResult.count,
      users: usersToDelete.map(u => u.id)
    });
  } catch (error) {
    return NextResponse.json({ message: 'Deletion failed!' }, { status: 500 });
  }
}