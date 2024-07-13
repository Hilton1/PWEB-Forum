import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "PWEB Fórum",
  description: "Fórum para a disciplina de programação web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt">
        <body className="bg-gray-100">
          <Header />
          <main 
            className="flex flex-col justify-center items-center p-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 2xl:px-[500px]"
          >
            <h1 className="text-4xl font-extrabold mb-10 text-center drop-shadow-lg">
              <span className="text-gray-900">PWEB</span> <span className="text-blue-600">Fórum</span>
            </h1>

            {children}
          </main>
          <footer className="mt-8 text-gray-500 text-center">
            <p>Bem-vindo ao PWEB Fórum. Encontre e compartilhe conhecimento!</p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
