import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";\nimport "./globals.css";\nconst arabicFont = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });
export const metadata: Metadata = { title: "المنظومة الذكية", description: "لمراجعة واعتماد تعيينات التربية الخاصة" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl" className={arabicFont.variable}><body>{children}</body></html>; }
