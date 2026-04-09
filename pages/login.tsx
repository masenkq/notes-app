import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Zabrání standardnímu znovunačtení stránky při odeslání formuláře
    setError("");

    // Zavolání NextAuth funkce pro přihlášení pomocí našeho "credentials" provideru
    const result = await signIn("credentials", {
      redirect: false, // Nechceme automatické přesměrování při chybě, chceme chybu vypsat
      username,
      password,
    });

    if (result?.error) {
      setError("Neplatné jméno nebo heslo.");
    } else {
      // Pokud je přihlášení úspěšné, přesměrujeme uživatele na hlavní stránku
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Přihlášení</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jméno</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border p-2 rounded text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-2 rounded text-black"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
}