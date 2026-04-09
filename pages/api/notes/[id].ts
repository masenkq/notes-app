import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ověření existence relace
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "Neautorizovaný přístup" });
  }

  // Extrakce parametrů z URL a relace
  const noteId = Number(req.query.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = Number((session.user as any).id);

  if (isNaN(noteId)) {
    return res.status(400).json({ message: "Neplatný identifikátor záznamu" });
  }

  // Autorizační kontrola: Ověření vlastnictví záznamu v databázi
  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return res.status(403).json({ message: "Přístup odepřen nebo záznam neexistuje" });
  }

  // Exekuce HTTP DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.note.delete({
        where: { id: noteId },
      });
      return res.status(200).json({ message: "Záznam byl úspěšně odstraněn" });
    } catch (error) {
      return res.status(500).json({ message: "Kritická chyba při odstraňování záznamu" });
    }
  }
// Exekuce HTTP PUT (Editace)
  if (req.method === "PUT") {
    const { title, content } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Titulek je povinný" });
    }

    try {
      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: { title, content },
      });
      return res.status(200).json(updatedNote);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při úpravě záznamu" });
    }
  }
  return res.status(405).json({ message: "Metoda nepovolena" });
}