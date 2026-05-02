import type { Metadata } from "next";
import { Manrope, Geist } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

const siteName = "Freelancer Expense Categorizer";
const siteDescription =
  "Upload bank statements and receipts, auto-categorize deductible expenses with AI, and export tax-ready reports in minutes.";

export const metadata: Metadata = {
  title: {
    default: `${siteName} | AI Categorization for Freelancer Taxes`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  metadataBase: new URL("https://freelancer-expense-categorizer.example.com"),
  openGraph: {
    title: `${siteName} | AI Categorization for Freelancer Taxes`,
    description: siteDescription,
    type: "website",
    url: "https://freelancer-expense-categorizer.example.com",
    siteName
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | AI Categorization for Freelancer Taxes`,
    description: siteDescription
  },
  keywords: [
    "freelancer taxes",
    "expense categorization",
    "Schedule C",
    "bookkeeping automation",
    "receipt categorizer"
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(manrope.className, "font-sans", geist.variable, "dark")}>
      <body>{children}</body>
    </html>
  );
}
