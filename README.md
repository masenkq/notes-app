# Aplikace pro správu poznámek (Notes App)
tento projekt je webova CRUD aplikace, byla vytvorrena na hodinu twa. umoznuje uzivatelum prihlaseni a registraci, spravu svych poznamke a jejich export import v json formatu.

# pouzite technologie
Frontend & Backend: Next.js (Pages Router), React
Databáze & ORM: PostgreSQL, Prisma ORM
Autentizace: NextAuth.js (Credentials provider) + bcrypt pro hashování hesel
Styling: Tailwind CSS
# pozadavky a kroky instalace
Před spuštěním projektu se ujistěte, že máte nainstalováno:
* [Node.js](https://nodejs.org/) (verze 18 nebo vyšší)
* Běžící PostgreSQL databázi (např. lokálně nebo v Docker kontejneru)
kroky instalace:
1. Naklonujte nebo stáhněte tento repozitář.
2. Otevřete složku s projektem v terminálu.
3. Nainstalujte všechny potřebné závislosti pomocí příkazu:
   ```bash
   npm install
# nastavani env
V kořenovém adresáři projektu najděte soubor .env.example.
Zkopírujte jej a přejmenujte kopii na .env.
Upravte hodnoty v .env podle vašeho lokálního nastavení:
DATABASE_URL = připojovací řetězec k vaší PostgreSQL databázi.
NEXTAUTH_SECRET = libovolný dlouhý a bezpečný textový řetězec pro šifrování relací.
# migrace a spusteni lokalne
npx prisma migrate dev...Vytvoření databázových tabulek
npm run seed..Naplnění databáze ukázkovými daty
npm run dev..Spuštění vývojového serveru
# prihlasovaci udaje demo uzivatele
Přihlašovací jméno: demo
Heslo: demo
(Aplikace samozřejmě plně podporuje i registraci zcela nových uživatelů přes /register).
# export a import json
Export poznámek:
Všechny poznámky: Kliknutím na modré tlačítko "Exportovat vše (JSON)" v hlavičce aplikace.
API Endpoint: GET /api/notes/export

Konkrétní poznámka: Kliknutím na ikonu šipky dolů (⬇️) u konkrétní poznámky v seznamu.
API Endpoint: GET /api/notes/export?id=[ID_POZNAMKY]

Import poznámek:

Klikněte na zelené tlačítko "Importovat (JSON)" v hlavičce aplikace a vyberte platný JSON soubor ze svého zařízení.