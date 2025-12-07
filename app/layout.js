import "./globals.css";

export const metadata = {
  title: "Rebase 2025",
  description: "Your year in code, visualized",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
