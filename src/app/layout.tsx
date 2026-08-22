import type { Metadata } from "next";
import { Covered_By_Your_Grace, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Covered_By_Your_Grace({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuBrief — Document Intelligence Workspace",
  description: "Generate structured summary briefs and audits from multi-page PDFs and images using Gemini AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

