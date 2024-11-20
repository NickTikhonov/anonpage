/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "~/styles/globals.css";

import { Fira_Code } from "next/font/google";
import { type Metadata } from "next";

const firaCode = Fira_Code({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fira-code",
});
// import { NeynarContext } from "./neynar_context";

export const metadata: Metadata = {
  title: "anon.page",
  description: "anonymouse cast aggregator",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${firaCode.variable}`}>
      {/* <NeynarContext> */}
        <body>{children}</body>
      {/* </NeynarContext> */}
    </html>
  );
}
