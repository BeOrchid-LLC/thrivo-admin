import { z } from "zod";

/**
 * Shared primitives + envelopes mirroring the backend contract
 * (BACKEND_ARCHITECTURE §3): success `{ data, meta }`, error
 * `{ error: { code, message, details? } }`. Admin lists are keyset/offset
 * paginated server-side — the browser never receives an unbounded dump.
 */
export const idSchema = z.string().min(1);
export const isoDateSchema = z.string();

export const paginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** A page of `item`s plus pagination info. */
export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), pagination: paginationMetaSchema });

export const successEnvelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ data, meta: z.unknown().optional() });

export const errorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;

export const ackSchema = z.object({ success: z.boolean() });
export type Ack = z.infer<typeof ackSchema>;

/** A named time series point used by the analytics charts. */
export const timePointSchema = z.object({ date: z.string(), value: z.number() });
export type TimePoint = z.infer<typeof timePointSchema>;
