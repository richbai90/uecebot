import { Client } from 'pg';

export async function connect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  return client;
}
