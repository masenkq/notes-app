import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "Jméno a heslo jsou povinné" });
  }

  try {
    // Kontrola, zda uživatel s tímto jménem už neexistuje
    const existingUser = await prisma.user.findUnique({
      where: { name: name },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Uživatel s tímto jménem již existuje" });
    }

    // Zašifrování hesla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vytvoření nového uživatele v databázi
    await prisma.user.create({
      data: {
        name,
        password: hashedPassword, 
      },
    });

    return res.status(201).json({ message: "Účet byl úspěšně vytvořen" });
  } catch (error) {
    console.error("Chyba při registraci:", error);
    return res.status(500).json({ message: "Chyba serveru při registraci" });
  }
}