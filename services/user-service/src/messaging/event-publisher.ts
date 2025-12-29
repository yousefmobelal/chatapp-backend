import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import {
  USER_CREATED_ROUTING_KEY,
  USER_EVENTS_EXCHANGE,
  UserCreatedEvent,
  UserCreatedPayload,
} from '@chatapp/common';
import { Channel, ChannelModel, connect, Connection } from 'amqplib';

// The benefit of using Pick is to just use "close " and "createChannel" methods from ChannelModel
type ManagedConnection = Connection & Pick<ChannelModel, 'close' | 'createChannel'>;

let connectionRef: ManagedConnection | null = null;
let channel: Channel | null = null;

const messagingEnabled = Boolean(env.RABBITMQ_URL);

const ensureChannel = async (): Promise<Channel | null> => {
  if (!messagingEnabled) {
    return null;
  }

  if (channel) {
    return channel;
  }

  const amqpConnection = (await connect(env.RABBITMQ_URL!)) as unknown as ManagedConnection;
  connectionRef = amqpConnection;
  amqpConnection.on('close', () => {
    logger.warn('RabbitMQ connection closed');
    connectionRef = null;
    channel = null;
  });

  amqpConnection.on('error', (err) => {
    logger.error({ err }, 'RabbitMQ connection error');
  });

  const amqpChannel = await amqpConnection.createChannel();
  channel = amqpChannel;
  await amqpChannel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', { durable: true });
  return amqpChannel;
};

export const initMessaging = async () => {
  if (!messagingEnabled) {
    logger.info('RabbitMQ URL is not configured. Messaging is disabled.');
    return;
  }

  await ensureChannel();
  logger.info('User service RabbitMQ publisher initialized.');
};

export const closeMessaging = async () => {
  try {
    const ch = channel;
    if (ch) {
      await ch.close();
      channel = null;
    }

    const conn = connectionRef;
    if (conn) {
      await conn.close();
      connectionRef = null;
    }

    logger.info('User service RabbitMQ publisher closed');
  } catch (err) {
    logger.error({ err }, 'Error closing RabbitMQ connection/channel');
  }
};

export const publishUserCreatedEvent = async (payload: UserCreatedPayload) => {
  const ch = await ensureChannel();
  if (!ch) {
    logger.debug({ payload }, 'Skipping user.created event publish: messaging disabled');
    return;
  }

  const event: UserCreatedEvent = {
    type: USER_CREATED_ROUTING_KEY,
    payload,
    occurredAt: new Date().toISOString(),
    metadata: { version: 1 },
  };
  try {
    const success = ch.publish(
      USER_EVENTS_EXCHANGE,
      USER_CREATED_ROUTING_KEY,
      Buffer.from(JSON.stringify(event)),
      { contentType: 'application/json', persistent: true },
    );

    if (!success) {
      logger.warn({ event }, 'Failed to publish user.created event');
    }
  } catch (err) {
    logger.error({ err }, 'Error publishing user.created event');
  }
};
