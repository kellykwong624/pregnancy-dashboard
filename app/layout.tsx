import "./globals.css";

export const metadata = {
  title: "Pregnancy Dashboard",
  description: "A private pregnancy and TTC tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
