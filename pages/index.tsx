import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

// 1. Definice datového typu pro poznámku
interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  
  // Lokální stavy komponenty
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2. Asynchronní funkce pro HTTP GET požadavek
  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Chyba sítě při stahování dat", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Spuštění stahování jakmile je uživatel ověřen
  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session]);

  // 4. Obsluha formuláře (HTTP POST požadavek)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        // Vyčištění formuláře po úspěšném zápisu
        setTitle("");
        setContent("");
        // Znovunačtení databáze => aktualizace UI
        fetchNotes();
      }
    } catch (error) {
      console.error("Chyba při odesílání dat", error);
    }
  };

  // UI pro načítání relace
  if (status === "loading") {
    return <div className="p-8 text-gray-500">Ověřování relace...</div>;
  }

  // UI pro nepřihlášeného klienta
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Aplikace Poznámky</h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Přejít na bezpečné přihlášení
        </Link>
      </div>
    );
  }

  // UI pro ověřeného uživatele (hlavní dashboard)
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Hlavička */}
        <div className="flex justify-between items-center bg-white p-6 rounded shadow mb-8">
          <h1 className="text-2xl font-bold">Přihlášen: {session.user?.name}</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Odhlásit se
          </button>
        </div>

        {/* Formulář pro novou poznámku */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Nová poznámka</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Titulek poznámky (povinné)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border p-2 rounded text-black w-full"
            />
            <textarea
              placeholder="Obsah poznámky..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="border p-2 rounded text-black w-full"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition self-start"
            >
              Uložit do databáze
            </button>
          </div>
        </form>

        {/* Výpis poznámek z databáze */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tvoje poznámky</h2>
          {isLoading ? (
            <p className="text-gray-500">Načítám data ze serveru...</p>
          ) : notes.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded shadow">Zatím tu nic není. Vytvoř první poznámku!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                  {note.content && (
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-4">
                    Vytvořeno: {new Date(note.createdAt).toLocaleString('cs-CZ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}