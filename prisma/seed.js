/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('./generated/client');
const bcrypt = require('bcrypt');


const prisma = new PrismaClient();

async function main() {
  console.log('Spouštím seedování databáze...');

  // 1. Zabezpečené heslo (Bcrypt)
  const plainPassword = 'demo';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 2. Vytvoření demo uživatele s unikátním emailem/jménem
  const demoUser = await prisma.user.upsert({
    where: { name: 'demo' },
    update: {}, 
    create: {
      name: 'demo',
      password: hashedPassword,
      notes: {
        create: [
          {
            title: 'Moje první poznámka',
            content: 'Tohle je obsah mojí první poznámky v Next.js aplikaci!',
          },
          {
            title: 'Nákupní seznam',
            content: 'Mléko, chleba, sýr a káva.',
          },
        ],
      },
    },
  });

  console.log('Seedování dokončeno!');
  console.log(`Byl vytvořen uživatel: ${demoUser.name} (heslo: ${plainPassword})`);
}

// Spuštění funkce a ošetření chyb
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });