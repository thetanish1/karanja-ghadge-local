import mongoose from 'mongoose';
import { config } from '../config/index.js';

let memoryServer: any = null;

export async function connectDB(overrideUri?: string): Promise<typeof mongoose> {
  const targetUri = overrideUri || config.mongodbUri;

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at: ${targetUri}`);
    return mongoose;
  } catch (err: any) {
    console.warn(`[Database] Could not connect to primary MongoDB (${targetUri}). Starting in-memory instance for developer resilience...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to resilient in-memory MongoDB at: ${memUri}`);
      return mongoose;
    } catch (memErr) {
      console.error('[Database] Fatal: Failed to initialize MongoDB connection:', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
