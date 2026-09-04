export type DomainErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'IDEMPOTENCY_REPLAY'
  | 'CONCURRENCY_CONFLICT'
  | 'INSUFFICIENT_STOCK';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
