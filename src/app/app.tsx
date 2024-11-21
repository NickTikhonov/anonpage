/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

"use client"

import { useEffect, useRef, useState } from "react";
import { anonFeed, fetchParentCast } from "./server";
import { type EmbedCast, type EmbedUrl, type CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { motion } from 'framer-motion';
import { LucideHeart, LucideMessageCircle, LucideRotateCcw, MessageSquareReply, Reply } from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  function merge(casts: CastWithInteractions[], newCasts: CastWithInteractions[]) {
    const newCastsHashes = newCasts.map(cast => cast.hash);
    const combined = casts.filter(cast => !newCastsHashes.includes(cast.hash)).concat(newCasts);
    const sortedRecentFirst = combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sortedRecentFirst;
  }

  const onLoadMore = async () => {
    setLoadingMore(true)
    if (anonCasts.length === 0) {
      return;
    }
    const lastCast = anonCasts[anonCasts.length - 1]!;
    const casts = await anonFeed(new Date(lastCast.timestamp));
    setAnonCasts((lastValue) => merge(lastValue, casts));
    setLoadingMore(false)
  }

  useEffect(() => {
    const updateFeed = async () => {
      console.log("Updating feed.");
      setRefreshing(true);
      const casts = await anonFeed();
      setRefreshing(false);
      setAnonCasts((lastValue) => merge(lastValue, casts));
    };

    void updateFeed();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(updateFeed, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-800 to-black p-2 lg:p-10">
      <Nav refreshing={refreshing} />
      <p className="py-2">
        anon.page: the anonymous Farcaster feed. A window into the unfiltered stream of human consciousness, refreshing every 10 seconds.
      </p>
      {anonCasts.length === 0 && (
        <Loader />
      )}
      <motion.div className="w-full h-full">
        {anonCasts.map((cast) => (
          <AnonCast key={cast.hash} cast={cast} />
        ))}
        <Button onClick={onLoadMore} size="lg" className="w-full" disabled={loadingMore || refreshing}>
          Load More
        </Button>
      </motion.div>
    </div>
  );
}

function Nav({ refreshing }: { refreshing: boolean }) {
  return (
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
      <CastButtonDialog refreshing={refreshing} />
    </nav>
  )
}

const ReactionStat = ({ icon: Icon, count, id }: { icon: React.ReactNode, count: number, id: string }) => {
  const prevCount = useRef(count);
  const prevId = useRef(id);

  const shouldAnimate = prevCount.current !== count && prevId.current === id;

  useEffect(() => {
    prevCount.current = count;
    prevId.current = id;
  }, [count, id]);

  return (
    <motion.div
      style={{ display: "flex", alignItems: "center", gap: "4px" }}
      animate={{ scale: shouldAnimate ? 1.2 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={shouldAnimate ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Icon}
      </motion.div>
      <span>{count}</span>
    </motion.div>
  );
};

function CastButtonDialog({ refreshing }: { refreshing: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {refreshing ? 
        (<Button size="sm" disabled>
          Refreshing...
          </Button>) :
        (<Button size="sm" className="bg-slate-900 text-white hover:bg-slate-500">
          Cast Anonymously
        </Button>)}
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
  )
}

function Loader() {
  return (
    <motion.div
      className="text-white text-center p-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <div className="flex justify-center gap-4">
        <motion.div
          className="text-4xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        >
          ?
        </motion.div>
        <motion.div
          className="text-4xl"
          animate={{
            rotate: [360, 0],
            scale: [1, 1.5, 1],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        >
          ?
        </motion.div>
        <motion.div
          className="text-4xl"
          animate={{
            rotate: [0, -360],
            scale: [1, 1.5, 1],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        >
          ?
        </motion.div>
      </div>
    </motion.div>
  )
}

function AnonCast({ cast, isParent }: { cast: CastWithInteractions, isParent?: boolean }) {
  const [parent, setParent] = useState<CastWithInteractions | null>(null);

  async function fetchParent(cast: CastWithInteractions) {
    if (!cast.parent_hash) {
      return
    }
    const parent = await fetchParentCast(cast.parent_hash)
    if (parent) {
      setParent(parent)
    }
  }

  useEffect(() => {
    if (isParent) return
    void fetchParent(cast)
  }, [cast, isParent])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.05,
        repeat: 4,
        repeatType: "reverse",
      }}
      className="w-full"
    >
      <div style={!isParent ? {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        backgroundColor: "black",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "10px",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
        width: "100%",
      }: { width: "100%"}} className="w-full">
        {parent && (
          <AnonCast cast={parent} isParent />
        )}
        {parent && (
          <div className="h-2"/>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
          className="w-full"
        >
          {parent && (
            <Reply size={24} style={{ transform: "rotate(180deg)" }} className="flex-none" />
          )}
          <a
            href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-none"
          >
            <img
              src={cast.author.pfp_url}
              alt=""
              className="w-8 h-8 rounded-full flex-none"
            />
          </a>
          <a
            href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <div className="w-full">
              <div className="w-full">
                {cast.text && (
                  <p className="text-white leading-tight">{cleanText(cast.text)}</p>
                )}
                {cast.embeds.map((embed, i) => {
                  if (embed.hasOwnProperty('cast')) {
                    const c = (embed as EmbedCast).cast;
                    return <div className="px-4 py-2 border border-white/20 rounded mt-2" key={i}>{c.text}</div>
                  } else {
                    const c = (embed as EmbedUrl)
                    if (c.metadata?.image) {
                      return (
                        <img
                          key={i}
                          src={c.url}
                          alt=""
                          className="max-w-[600px] w-full mt-4 mb-1"
                        />
                      );
                    } else {
                      return null
                    }
                  }
                })}
              </div>
              <div className="w-full flex items-center gap-2 text-gray-500 text-sm mt-2">
                <ReactionStat icon={<LucideHeart size={16} />} count={cast.reactions.likes_count} id={cast.hash} />
                <ReactionStat icon={<LucideRotateCcw size={16} />} count={cast.reactions.recasts_count} id={cast.hash} />
                <ReactionStat icon={<LucideMessageCircle size={16} />} count={cast.replies.count} id={cast.hash} />
                <span className="flex-grow"></span>
                <span>{new Date(cast.timestamp).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric' })}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </motion.div>
  )
}