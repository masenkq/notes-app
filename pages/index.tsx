import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
// 1. Definice datového typu pro poznámku
interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();

// Lokální stavy komponenty
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Stavy pro režim editace
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Přečteme soubor a uděláme z něj JSON
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Pošleme data na náš nový import endpoint
      const res = await fetch("/api/notes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (res.ok) {
        alert("Poznámky byly úspěšně importovány!");
        fetchNotes(); // Obnoví seznam poznámek
      } else {
        const errorData = await res.json();
        alert(`Chyba importu: ${errorData.message}`);
      }
    } catch (error) {
      alert("Soubor se nepodařilo přečíst. Zkontrolujte, zda jde o platný JSON.");
    } finally {
      // Vyčistíme input, aby šel případně nahrát znovu stejný soubor
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
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
// Obsluha odstranění (HTTP DELETE požadavek)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Opravdu chcete tento záznam trvale odstranit?")) return;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Filtrace pole a aktualizace lokálního stavu => zamezení zbytečného znovunačítání stránky
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error("Chyba sítě při odstraňování záznamu", error);
    }
  };

  // Přepnutí do režimu editace
  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || "");
  };

  // Uložení upravené poznámky (HTTP PUT)
  const handleUpdate = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        setEditingId(null); // Vypne režim editace
        fetchNotes(); // Znovu stáhne aktuální data z databáze
      }
    } catch (error) {
      console.error("Chyba při úpravě", error);
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
          <div className="flex gap-4">
            
            {/* Skrytý input pro File API */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
            
            {/* Nové zelené tlačítko pro Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              title="Nahrát poznámky z JSON souboru"
            >
              Importovat (JSON)
            </button>

            <button
              onClick={() => window.open("/api/notes/export", "_blank")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              title="Stáhnout všechny poznámky"
            >
              Exportovat vše (JSON)
            </button>

            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Odhlásit se
            </button>

          </div>
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
                <div key={note.id} className="bg-white p-6 rounded shadow border-l-4 border-blue-500 relative">
                  
                  {/* Podmínka: Pokud editujeme, ukaž formulář, jinak ukaž normální text */}
                  {editingId === note.id ? (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        className="border p-2 rounded text-black font-bold"
                      />
                      <textarea 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)} 
                        rows={3} 
                        className="border p-2 rounded text-black"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleUpdate(note.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Uložit</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">Zrušit</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Tlačítka pro export, mazání a editaci */}
                      <div className="absolute top-4 right-4 flex gap-3 text-xl">
                        <button onClick={() => window.open(`/api/notes/export?id=${note.id}`, "_blank")} className="hover:scale-110 transition" title="Exportovat poznámku">
                          ⬇️
                        </button>
                        <button onClick={() => startEditing(note)} className="hover:scale-110 transition" title="Upravit záznam">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(note.id)} className="hover:scale-110 transition" title="Odstranit záznam">
                          🗑️
                        </button>
                      </div>

                      <h3 className="text-lg font-bold mb-2 pr-16">{note.title}</h3>
                      {note.content && (
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-4">
                        Vytvořeno: {new Date(note.createdAt).toLocaleString('cs-CZ')}
                        <br />
                    Poslední úprava: {new Date(note.updatedAt).toLocaleString('cs-CZ')}
                      </p>
                      
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}