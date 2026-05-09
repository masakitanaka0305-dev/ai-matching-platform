import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Matching Platform | AI/MLエンジニア専門マッチング",
  description:
    "AI・機械学習エンジニアに特化したマッチングプラットフォーム。1,200名以上のエンジニアと300社以上の企業が利用。無料で市場価値診断も可能です。",
  openGraph: {
    title: "AI Matching Platform | AI/MLエンジニア専門マッチング",
    description:
      "AI・機械学習エンジニアに特化したマッチングプラットフォーム。無料市場価値診断・スキルスコアリング・最適企業マッチング。",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Matching Platform",
    description: "AI/MLエンジニア専門マッチングプラットフォーム",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
