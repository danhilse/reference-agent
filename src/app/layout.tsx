import "~/styles/globals.css";
import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";

// Initialize the Open Sans font
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  // You can specify weight if needed
  weight: ["300", "400", "600", "700"],
  variable: "--font-open-sans", // Optional: for use with CSS variables
});

export const metadata: Metadata = {
  title: "Act-On Customer Reference Agent",
  description: "Find customer quotes and references for sales conversations",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={openSans.className}>
      <body>{children}</body>
    </html>
  );
}
