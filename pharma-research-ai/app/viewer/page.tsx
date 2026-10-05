import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PharmaResearchApp from '@/components/pharma-research-app'

interface Props {
  searchParams: Promise<{ documentId?: string }>
}

export default async function ViewerPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { documentId } = await searchParams
  if (!documentId) redirect('/documents')

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      chunks: {
        orderBy: [{ pageNumber: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, pageNumber: true, content: true },
      },
    },
  })

  if (!document) notFound()
  if (document.userId !== session.userId) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-muted-foreground">You do not have access to this document.</p>
      </main>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  })

  if (!user) redirect('/login')

  // Serialize Prisma Date objects to strings for client component
  const serializedDocument = {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }

  return <PharmaResearchApp user={user} initialTab="viewer" viewerDocument={serializedDocument} />
}
