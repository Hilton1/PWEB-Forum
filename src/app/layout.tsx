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
        <body>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
