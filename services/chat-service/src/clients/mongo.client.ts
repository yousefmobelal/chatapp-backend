import { MongoClient } from 'mongodb';

import { logger } from '@/utils/logger';
import { env } from '@/config/env';

let client: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  const mongoUrl = env.MONGO_URL;
  client = new MongoClient(mongoUrl);

  await client.connect();
  logger.info('MongoDB connected successfully');
  return client;
};

export const closeMongoClient = async () => {
  if (!client) {
    return;
  }

  await client.close();
  logger.info('MongoDB connection closed');
  client = null;
};
