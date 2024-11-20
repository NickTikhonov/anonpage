"use client"

import { NeynarContextProvider, Theme } from "@neynar/react";
import { env } from "~/env";

export function NeynarContext({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NeynarContextProvider
      settings={{
        clientId: env.NEXT_PUBLIC_NEYNAR_CLIENT_ID ?? "",
        defaultTheme: Theme.Dark,
        eventsCallbacks: {
          onAuthSuccess: () => { void 0 },
          onSignout() { void 0 },
        },
      }}
    >
      <body>{children}</body>
    </NeynarContextProvider>
  )
}