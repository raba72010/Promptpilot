import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptPilot — Perfect your AI request",
  description:
    "Turn your rough idea into the best zero-shot prompt. PromptPilot recommends the right AI tool and generates a model-optimized prompt pack — instantly, with no account required.",
  keywords: ["AI prompts", "prompt engineering", "ChatGPT", "Claude", "Midjourney", "prompt optimizer"],
  authors: [{ name: "PromptPilot" }],
  openGraph: {
    type: "website",
    title: "PromptPilot — Perfect your AI request",
    description:
      "Describe what you want once. Get the best prompt and tool recommendation — instantly.",
    siteName: "PromptPilot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromptPilot — Perfect your AI request before you use the model",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptPilot — Perfect your AI request",
    description:
      "Describe what you want once. Get the best prompt and tool recommendation — instantly.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://promptpilot.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
