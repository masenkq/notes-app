import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Povolujeme pouze čtení (HTTP GET)
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: "Neautorizovaný přístup" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = Number((session.user as any).id);
  const noteId = req.query.id ? Number(req.query.id) : null;

  try {
    let exportData;
    let filename;

    // Generování data pro název souboru (formát YYYYMMDD)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (noteId) {
      // Varianta A: Export jedné konkrétní poznámky
      const note = await prisma.note.findUnique({
        where: { id: noteId },
      });

      if (!note || note.userId !== userId) {
        return res.status(404).json({ message: "Záznam nenalezen nebo přístup odepřen" });
      }

      // Destrukturalizace => odstranění 'userId' z objektu
      const { userId: _, ...safeNote } = note;
      exportData = safeNote;
      filename = `note-${noteId}-${dateStr}.json`;

    } else {
      // Varianta B: Export všech poznámek uživatele
      const notes = await prisma.note.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      });

      // Iterace přes pole a odstranění 'userId' z každého objektu
      exportData = notes.map(({ userId: _, ...safeNote }) => safeNote);
      filename = `notes-export-${dateStr}.json`;
    }

    // Nastavení povinných HTTP hlaviček pro stažení souboru (přesně podle zadání)
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    // Odeslání formátovaného JSON řetězce (s odsazením 2 mezery pro čitelnost)
    return res.status(200).send(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error("Kritická chyba při generování exportu:", error);
    return res.status(500).json({ message: "Chyba serveru při exportu dat" });
  }
}