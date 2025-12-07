import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "Rebase 2025",
  description: "Your year in code, visualized",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
