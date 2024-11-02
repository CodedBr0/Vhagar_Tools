import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletContextProvider from "@/components/WalletContextProvider";
import { NetworkProvider } from "@/components/NetworkContext";

export const metadata = {
  title: "Vhagar Tools",
  description: "Management tools for Vhagar on Solana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <NetworkProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </NetworkProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}