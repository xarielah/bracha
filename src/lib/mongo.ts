import { MongoClient, type Collection, type Db, type Document } from 'mongodb';

export interface GreetingDoc {
  _id: string;
  holiday: string;
  fromNames: string;
  toNames: string;
  message: string;
  createdAt: Date;
}

const uri = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;
const dbName = import.meta.env.MONGODB_DB || process.env.MONGODB_DB || 'bracha';

if (!uri) {
  // Don't throw at import time during build of static pages; the API route will surface it.
  console.warn('[mongo] MONGODB_URI is not set – the greetings API will fail until it is configured.');
}

// Cache the client across serverless invocations / HMR reloads.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  if (!uri) return Promise.reject(new Error('MONGODB_URI is not configured'));
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export async function getGreetingsCollection(): Promise<Collection<GreetingDoc>> {
  return getCollection<GreetingDoc>('greetings');
}
