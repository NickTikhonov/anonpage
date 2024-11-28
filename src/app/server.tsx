/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server"

import pg from 'pg'
import { env } from '~/env';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions } from '@neynar/nodejs-sdk/build/neynar-api/v2';

type DeletedCast = {
  fid: number,
  pfp_url: string,
  text: string,
  timestamp: Date,
}

async function getClient() {
  const pgClient = new pg.Client({
    connectionString: env.NEYNAR_DB_URL,
  })
  const connectPromise = pgClient.connect()
  await connectPromise
  return pgClient
}

export async function anonFeed(from?: Date) {
  return await fetchRecentAnonCasts(from)
}

export async function fetchParentCast(hash: string) {
  const neynar = new NeynarAPIClient(env.NEYNAR_API_KEY);
  const casts = await neynar.fetchBulkCasts([hash])
  if (casts.result.casts.length === 0) {
    return undefined
  }
  return casts.result.casts[0]
}

async function fetchDeletedCasts(from?: Date) {
  const pgClient = await getClient()

  const timestampClause = from ? `AND timestamp < '${from.toISOString()}'` : '';

  // Execute the query (example using node-postgres)
  const result = await pgClient.query(
    `
SELECT fid, pfp_url, text, timestamp
FROM "public"."deleted_casts"
WHERE fid IN (880094, 862100, 193315, 883030, 883287)
${timestampClause}
ORDER BY timestamp DESC
LIMIT 20;`
  );

  const deletedCasts = result.rows as DeletedCast[]
  await pgClient.end()
  return deletedCasts
}

async function fetchRecentAnonCasts(from?: Date) {
  const pgClient = await getClient()
  const neynar = new NeynarAPIClient(env.NEYNAR_API_KEY);

  const timestampClause = from ? `AND timestamp < '${from.toISOString()}'` : '';

  // Execute the query (example using node-postgres)
  const result = await pgClient.query(
    `
SELECT '0x' || encode(hash, 'hex') as hash
FROM "public"."casts"
WHERE fid IN (880094, 862100, 193315, 883030, 883287)
${timestampClause}
ORDER BY timestamp DESC
LIMIT 20;`
  );

  const hashes = result.rows.map(r => r.hash) as string[]
  console.log(`Fetching ${hashes.length} casts.`)
  const castData = (await neynar.fetchBulkCasts(hashes)).result.casts
  await pgClient.end()
  return castData
}