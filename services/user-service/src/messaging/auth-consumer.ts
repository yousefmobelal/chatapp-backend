/**
 * @file Manages the RabbitMQ consumer for authentication events.
 * This module is responsible for connecting to RabbitMQ, consuming user registration events
 * from the auth-service, and syncing the user data with the local database.
 */

import { env } from '@/config/env';
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  type AuthRegisterEvent,
} from '@chatapp/common';
import { Channel, ChannelModel, Connection, ConsumeMessage, Replies, connect } from 'amqplib'; // Import RabbitMQ library components.

// Define a type that merges Connection and ChannelModel for easier management.
type ManageConnection = Connection & ChannelModel;

/**
 * A reference to the current RabbitMQ connection.
 * @type {(ManageConnection | null)}
 */
let connectionRef: ManageConnection | null = null; // Holds the current RabbitMQ connection reference;
/**
 * The RabbitMQ channel used for communication.
 * @type {(Channel | null)}
 */
let channel: Channel | null = null; // Holds the current RabbitMQ channel.
/**
 * The consumer tag for the active consumer.
 * @type {(string | null)}
 */
let consumerTag: string | null = null; // Holds the consumer tag for the message consumer.

/**
 * The name of the queue for auth events.
 */
const QUEUE_NAME = 'auth-service.auth-events'; // Define the queue name for authentication events.

/**
 * Closes the RabbitMQ connection and resets the state variables.
 * @param {ManageConnection} conn - The connection to close.
 */
const closeConnection = async (conn: ManageConnection) => {
  await conn.close(); // Asynchronously close the provided connection.
  connectionRef = null; // Reset the connection reference.
  channel = null; // Reset the channel reference.
  consumerTag = null; // Reset the consumer tag.
};

/**
 * Handles an incoming message from the queue.
 * It parses the message, syncs the user with the database, and acknowledges the message.
 * @param {ConsumeMessage} message - The message from RabbitMQ.
 * @param {Channel} ch - The channel the message was received on.
 */
const handleMessage = async (message: ConsumeMessage, ch: Channel) => {
  const raw = message.content.toString('utf-8'); // Convert the message content to a UTF-8 string.
  const event = JSON.parse(raw) as AuthRegisterEvent; // Parse the JSON string into an AuthRegisterEvent.
  await userService.syncFromAuthUser(event.payload); // Sync the user data from the event payload.

  ch.ack(message); // Acknowledge the message, removing it from the queue.
};

/**
 * Starts the consumer for authentication events.
 * It connects to RabbitMQ, sets up the exchange, queue, and bindings,
 * and starts consuming messages.
 */
export const startAuthEventConsumer = async () => {
  // Check if the RabbitMQ URL is configured.
  if (!env.RABBITMQ_URL) {
    // Log a warning if the URL is not set and exit.
    logger.warn('RABBITMQ_URL is not set. Skipping auth event consumer initialization.');
    return;
  }

  // If a channel already exists, do nothing.
  if (channel) {
    return;
  }

  const connection = (await connect(env.RABBITMQ_URL)) as ManageConnection; // Connect to RabbitMQ.
  connectionRef = connection; // Store the connection reference.
  const ch = await connectionRef.createChannel(); // Create a new channel.
  channel = ch; // Store the channel reference.

  await ch.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true }); // Assert that the exchange exists and is durable.
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true }); // Assert that the queue exists and is durable.
  await channel.bindQueue(queue.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY); // Bind the queue to the exchange with a routing key.

  // Define the handler for incoming messages.
  const consumeHandler = (msg: ConsumeMessage | null) => {
    // If the message is null, do nothing.
    if (!msg) {
      return;
    }

    // Handle the message, and catch any errors.
    void handleMessage(msg, ch).catch((err: unknown) => {
      logger.error({ err }, 'Failed to process auth event message'); // Log the error.
      ch.nack(msg, false, false); // Negatively acknowledge the message without requeueing.
    });
  };

  const result: Replies.Consume = await ch.consume(queue.queue, consumeHandler); // Start consuming messages from the queue.
  consumerTag = result.consumerTag; // Store the consumer tag.

  // Set up a listener for the 'close' event on the connection.
  connection.on('close', () => {
    logger.warn('Auth consumer connection closed'); // Log a warning when the connection is closed.
    connectionRef = null; // Reset the connection reference.
    channel = null; // Reset the channel reference.
    consumerTag = null; // Reset the consumer tag.
  });

  // Set up a listener for the 'error' event on the connection.
  connection.on('error', (err: unknown) => {
    logger.error({ err }, 'Auth consumer connection error'); // Log any connection errors.
  });

  logger.info('Auth event consumer started'); // Log that the consumer has started.
};

/**
 * Stops the consumer for authentication events.
 * It cancels the consumer, closes the channel, and closes the connection.
 */
export const stopAuthEventConsumer = async () => {
  try {
    const ch = channel; // Get the current channel.
    // If the channel and consumer tag exist, cancel the consumer.
    if (ch && consumerTag) {
      await ch.cancel(consumerTag); // Cancel the consumer.
      consumerTag = null; // Reset the consumer tag.
      channel = null; // Reset the channel reference.
    }

    // If the channel exists, close it.
    if (ch) {
      await ch.close(); // Close the channel.
      channel = null; // Reset the channel reference.
    }

    const conn = connectionRef; // Get the current connection.
    // If the connection exists, close it.
    if (conn) {
      await closeConnection(conn); // Close the connection.
      connectionRef = null; // Reset the connection reference.
    }
  } catch (err) {
    // Log any errors that occur while stopping the consumer.
    logger.error({ err }, 'Failed to stop auth event consumer');
  }
};
