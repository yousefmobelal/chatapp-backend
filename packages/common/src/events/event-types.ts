export type EventPayload = Record<string, unknown>;

export interface DomainEvent<TType extends string, Tpayload extends EventPayload> {
  type: TType;
  payload: Tpayload;
  occurredAt: string;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  version?: number;
}

export interface OutboundEvent<
  TType extends string,
  Tpayload extends EventPayload,
> extends DomainEvent<TType, Tpayload> {
  metadata?: EventMetadata;
}

export interface InboundEvent<
  TType extends string,
  Tpayload extends EventPayload,
> extends DomainEvent<TType, Tpayload> {
  metadata?: EventMetadata;
}
