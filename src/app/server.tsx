/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server"

const pgClient = new pg.Client({
  connectionString: env.NEYNAR_DB_URL,
})
const connectPromise = pgClient.connect()

async function getClient() {
  await connectPromise
  return pgClient
}

import pg from 'pg'
import { env } from '~/env';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export async function anonFeed(from?: Date) {
  return await fetchRecentAnonCasts(from)
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
WHERE fid IN (880094, 862100, 193315)
AND parent_hash is NULL
${timestampClause}
ORDER BY timestamp DESC
LIMIT 20;`
  );

  const hashes = result.rows.map(r => r.hash) as string[]
  console.log(`Fetching ${hashes.length} casts.`)
  const castData = (await neynar.fetchBulkCasts(hashes)).result.casts
  return castData
}