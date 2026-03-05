import "./globals.css";

export const metadata = {
  title: "Oberursel Wahl-Check 2026 (Beta)",
  description: "Ein inoffizieller Wahl-O-Mat-ähnlicher Check für die Kommunalwahl in Oberursel (März 2026).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
