/**
 * Shared zod schemas for MCP tool parameters.
 *
 * @module schemas
 */

import { z } from 'zod';

/**
 * Validated `limit` parameter for `query_intelligence`.
 *
 * Positive integers 1–50, defaulting to 10. The tool additionally
 * clamps its argument so direct callers cannot bypass this schema.
 */
export const limitSchema = z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe('Max results to return (1–50)');
