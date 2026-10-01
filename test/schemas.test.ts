// Isolation must come first: src modules resolve their data paths from env
// at import time, and static imports evaluate in declaration order.
import './helpers/env.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { limitSchema } from '../src/schemas.js';

describe('query_intelligence limit schema (audit finding 5)', () => {
    it('defaults to 10 when omitted', () => {
        assert.strictEqual(limitSchema.parse(undefined), 10);
    });

    it('accepts positive integers and coerces numeric strings', () => {
        assert.strictEqual(limitSchema.parse(25), 25);
        assert.strictEqual(limitSchema.parse('10'), 10);
        assert.strictEqual(limitSchema.parse(50), 50);
    });

    it('rejects zero, negatives, floats, non-numeric strings, empty strings, and null', () => {
        for (const bad of [0, -1, 1.5, 'foo', '', null]) {
            assert.throws(() => limitSchema.parse(bad), `limit ${String(bad)} must be rejected`);
        }
    });

    it('rejects values above the cap of 50', () => {
        assert.throws(() => limitSchema.parse(51));
    });
});
