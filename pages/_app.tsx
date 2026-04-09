import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css"; // Globální CSS soubor (např. pro Tailwind)

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    // SessionProvider zajistí, že data o přihlášení budou dostupná všude v aplikaci
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}