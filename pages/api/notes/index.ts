import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validace autorizace na straně serveru
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "Neautorizovaný přístup" });
  }

  // Extrakce ID uživatele a konverze na Integer (Prisma to tak vyžaduje ve schématu)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = Number((session.user as any).id);

  // 2. Obsluha metody GET => Načtení dat
  if (req.method === "GET") {
    try {
      const notes = await prisma.note.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" }, // Od nejnovějších
      });
      return res.status(200).json(notes);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při načítání poznámek" });
    }
  }

  // 3. Obsluha metody POST => Zápis do databáze
  if (req.method === "POST") {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Titulek je povinný" });
    }

    try {
      const newNote = await prisma.note.create({
        data: {
          title,
          content,
          userId: userId,
        },
      });
      return res.status(201).json(newNote);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při vytváření poznámky" });
    }
  }

  // Pokud na endpoint přijde nepodporovaná HTTP metoda (např. PUT nebo DELETE)
  return res.status(405).json({ message: "Metoda nepovolena" });
}