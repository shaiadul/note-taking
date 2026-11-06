import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { getCurrentUserAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "SecureNotes | Role-Based Encrypted Note-Taking",
  description: "Enterprise secure note-taking application with RBAC, MongoDB aggregations, and rate limiting."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserAction();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <ThemeProvider>
          <Navbar user={user} />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-muted py-6 text-center text-xs text-muted-foreground">
            <div className="mx-auto max-w-7xl px-4">
              Secure Note-Taking Platform • MongoDB Aggregations &amp; RBAC Architecture
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
