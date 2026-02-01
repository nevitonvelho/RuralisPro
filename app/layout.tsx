import type { Metadata } from "next";
// 1. Importamos a Roboto do pacote oficial do Next
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";

// 2. Configuramos a fonte (pesos, subsets, etc)
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"], // Todos os pesos que você queria
  variable: "--font-roboto", // Opcional: cria uma variável CSS se precisar
});

export const metadata: Metadata = {
  title: "RuralisPRO | Calculadoras Agro",
  description: "Portal inteligente de cálculos para o agronegócio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* Removemos os <link> manuais do head, o Next cuida disso agora */}
      <head />

      {/* 3. Aplicamos roboto.className no body. 
          Isso aplica a fonte no site todo automaticamente. */}
      <body className={`${roboto.className} bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          <div className="no-print">
            <Navbar />
          </div>
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-10">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              © 2026 RuralisPRO - Ferramentas de Precisão para o Campo.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}