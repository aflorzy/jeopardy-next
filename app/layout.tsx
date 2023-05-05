import Header from "./components/Header";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Jeopardy!",
  description: "Play Jeopardy! games on demand",
  keywords: "jeopardy, online, play, games, trivia, quiz, j-archive, jarchive",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col items-center bg-blue-950`}>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
