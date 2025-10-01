import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Mess Management System",
  description: "Manage your mess orders efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
