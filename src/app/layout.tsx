import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proposales interview",
  description: "A second look at your proposal before it is sent",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="bg-[#141414]">
      <body className="bg-[#141414] text-neutral-100">{children}</body>
    </html>
  );
}
