import { prisma } from "@/lib/db";

export async function ensureLibraryItem(developmentId: string) {
  const existing = await prisma.libraryItem.findUnique({ where: { developmentId } });
  if (existing) return existing;
  return prisma.libraryItem.create({ data: { developmentId } });
}
