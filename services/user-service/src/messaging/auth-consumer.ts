import { env } from '@/config/env';
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  type AuthRegisterEvent,
} from '@chatapp/common';
import { Channel, ChannelModel, Connection, ConsumeMessage, Replies, connect } from 'amqplib';

type ManageConnection = Connection & ChannelModel;

let connectionRef: ManageConnection | null = null;
let channel: Channel | null = null;
let consumerTag: string | null = null;

const QUEUE_NAME = 'auth-service.auth-events';

const closeConnection = async (conn: ManageConnection) => {
  await conn.close();
  connectionRef = null;
  channel = null;
  consumerTag = null;
};

const handleMessage = async (message: ConsumeMessage, ch: Channel) => {
  const raw = message.content.toString('utf-8');
  const event = JSON.parse(raw) as AuthRegisterEvent;
  await userService.syncFromAuthUser(event.payload);

  ch.ack(message);
};

export const startAuthEventConsumer = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL is not set. Skipping auth event consumer initialization.');
    return;
  }

  if (channel) {
    return;
  }

  const connection = (await connect(env.RABBITMQ_URL)) as ManageConnection;
  connectionRef = connection;
  const ch = await connectionRef.createChannel();
  channel = ch;

  await ch.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(queue.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY);

  const consumeHandler = (msg: ConsumeMessage | null) => {
    if (!msg) {
      return;
    }

    void handleMessage(msg, ch).catch((err: unknown) => {
      logger.error({ err }, 'Failed to process auth event message');
      ch.nack(msg, false, false);
    });
  };

  const result: Replies.Consume = await ch.consume(queue.queue, consumeHandler);
  consumerTag = result.consumerTag;

  connection.on('close', () => {
    logger.warn('Auth consumer connection closed');
    connectionRef = null;
    channel = null;
    consumerTag = null;
  });

  connection.on('error', (err: unknown) => {
    logger.error({ err }, 'Auth consumer connection error');
  });

  logger.info('Auth event consumer started');
};

export const stopAuthEventConsumer = async () => {
  try {
    const ch = channel;
    if (ch && consumerTag) {
      await ch.cancel(consumerTag);
      consumerTag = null;
      channel = null;
    }

    if (ch) {
      await ch.close();
      channel = null;
    }

    const conn = connectionRef;
    if (conn) {
      await closeConnection(conn);
      connectionRef = null;
    }
  } catch (err) {
    logger.error({ err }, 'Failed to stop auth event consumer');
  }
};
