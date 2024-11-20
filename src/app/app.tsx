/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

"use client"

import { useEffect, useState } from "react";
import { anonFeed } from "./server";
import { type CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

function cleanText(text: string) {
  return text.split(" ").map((word) => {
    if (word.length > 20) {
      return word.slice(0, 20) + "...";
    }
    return word;
  }).join(" ");
}

export function App() {
  const [anonCasts, setAnonCasts] = useState<CastWithInteractions[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => {
      console.log("Updating feed.")
      const casts = await anonFeed();
      setAnonCasts(casts);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-800 to-black p-2 lg:p-10">
      <nav className="flex items-center gap-4 mb-2 text-white font-bold text-2xl">
        <div className="flex-grow flex flex-row gap-2 items-center">
          <div className="w-10 h-10 grid place-items-center text-xl bg-black">
            ?
          </div>
          <div className="flex-col">
            <h1 className="text-xl">
              anon.page
            </h1>
            <p className="text-xs font-muted-foreground">
              anonymous cast aggregator
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              Cast Anonymously
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cast Anonymously</DialogTitle>
              <DialogDescription>
                Cast anonymously to the world. Whilst you can&apos;t cast directly through anon.page,
                you can cast through one of the following platforms that support anonymous casting:
              </DialogDescription>
              <ul className="mt-10">
                <li><a href="https://anoncast.org/" target="_blank" rel="noopener noreferrer">anoncast</a></li>
                <li><a href="https://33bits.xyz/" target="_blank" rel="noopener noreferrer">33bits</a></li>
                <li><a href="https://www.supercast.xyz/" target="_blank" rel="noopener noreferrer">supercast</a></li>
              </ul>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </nav>
      {anonCasts.length === 0 && (
        <div className="text-white text-center">
          <p>Loading...</p>
        </div>
      )}
      {anonCasts.map((cast, index) => (
        <a
          key={cast.hash}
          href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              backgroundColor: "black",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <img
              src={cast.author.pfp_url}
              alt=""
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            />
            <div>
              <div>
                {cast.text && (
                  <p style={{ color: "white", lineHeight: "1.2" }}>{cleanText(cast.text)}</p>
                )}
                {cast.embeds.map((embed, index) => {
                  const imageUrl = (embed as any).url as string
                  return (
                    <img
                      key={index}
                      src={imageUrl}
                      alt=""
                      style={{ maxWidth: "100%", marginTop: "5px", marginBottom: "5px" }}
                    />
                  );
                })}
              </div>
              <div style={{ color: "gray", fontSize: "12px" }}>
                <span>casted by {cast.author.username}</span>
                <span> - {new Date(cast.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
      {/* <a href="https://www.activism.net/cypherpunk/manifesto.html">
        <marquee className="text-white text-sm" behavior="scroll" direction="left" scrollamount="5">
          Privacy is necessary for an open society in the electronic age. Privacy is not secrecy. A private matter is something one doesn't want the whole world to know, but a secret matter is something one doesn't want anybody to know. Privacy is the power to selectively reveal oneself to the world.
        </marquee>
      </a> */}
    </div>
  );
}