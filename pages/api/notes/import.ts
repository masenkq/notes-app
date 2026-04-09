import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Konfigurace pro omezení velikosti payloadu (dle zadání)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', 
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: "Neautorizovaný přístup" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = Number((session.user as any).id);

  try {
    const data = req.body;
    
    // Podle zadání: Může přijít jeden objekt, nebo pole objektů. Obalíme to do pole vždy.
    const items = Array.isArray(data) ? data : [data];

    // Omezení počtu položek (ochrana databáze)
    if (items.length > 50) {
      return res.status(400).json({ message: "Překročen limit importovaných položek (max 50)." });
    }

    // Příprava a validace dat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notesToCreate = items.map((item: any) => {
      // Validace: title je povinný
      if (!item.title || String(item.title).trim() === "") {
        throw new Error("Každá poznámka musí mít vyplněný titulek (title).");
      }
      
      return {
        title: String(item.title),
        content: item.content ? String(item.content) : null,
        userId: userId, // DŮLEŽITÉ: Ignorujeme id z JSONu a vnutíme id aktuálního uživatele
        ...(item.createdAt && !isNaN(Date.parse(item.createdAt)) && { createdAt: new Date(item.createdAt) }),
        ...(item.updatedAt && !isNaN(Date.parse(item.updatedAt)) && { updatedAt: new Date(item.updatedAt) }),
      };
    });

    // Zápis do databáze (hromadně)
    const created = await prisma.note.createMany({
      data: notesToCreate,
    });

    return res.status(201).json({ message: `Úspěšně importováno ${created.count} poznámek.` });
  } catch (error: unknown) {
    console.error("Chyba importu:", error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(400).json({ message: (error as any).message || "Neplatný formát dat." });
  }
}