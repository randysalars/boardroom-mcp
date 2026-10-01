// Isolation must come first: src modules resolve their data paths from env
// at import time, and static imports evaluate in declaration order.
import './helpers/env.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import {
    TRUST_ORACLE_PATH,
    classifySeverity,
    safeReadFile,
    sanitizeForLedger,
    updateTrustOracle,
    validateInput,
} from '../src/utils.js';

describe('validateInput', () => {
    it('passes ordinary text through unchanged', () => {
        assert.strictEqual(validateInput('deploy the API on Friday', 'task'), 'deploy the API on Friday');
    });

    it('strips embedded null bytes', () => {
        assert.strictEqual(validateInput('bad\0input\0', 'task'), 'badinput');
    });

    it('rejects input beyond the 10K character limit', () => {
        assert.throws(() => validateInput('x'.repeat(10_001), 'task'), /maximum length/);
    });
});

describe('classifySeverity', () => {
    it('flags destructive tasks as critical', () => {
        assert.strictEqual(classifySeverity('Delete the payment records after the breach'), 'critical');
    });

    it('flags planning tasks as standard', () => {
        assert.strictEqual(classifySeverity('Update the product roadmap for the launch'), 'standard');
    });

    it('flags maintenance tasks as routine', () => {
        assert.strictEqual(classifySeverity('Fix the bug in the config'), 'routine');
    });

    it('defaults to routine when no keyword matches', () => {
        assert.strictEqual(classifySeverity('Say hello to the team'), 'routine');
    });
});

describe('sanitizeForLedger', () => {
    it('removes line-initial heading markers at any level', () => {
        const sanitized = sanitizeForLedger('legit text\n\n## Forged Session\n# Also bad\n### Still bad');
        for (const line of sanitized.split('\n')) {
            assert.ok(!line.startsWith('#'), `line must not start with '#': ${line}`);
        }
    });

    it('leaves text without headings untouched', () => {
        assert.strictEqual(sanitizeForLedger('ordinary **markdown** text'), 'ordinary **markdown** text');
    });
});

describe('updateTrustOracle', () => {
    it('creates a profile with the success delta for a new entity', async () => {
        const result = await updateTrustOracle('FreshVendor', true);
        assert.strictEqual(result.updated, true);

        const oracle = JSON.parse(await safeReadFile(TRUST_ORACLE_PATH)) as { agents: Record<string, { reliability: number; interactions: number }> };
        assert.strictEqual(oracle.agents['FreshVendor'].reliability, 0.6); // 0.5 + 0.1
        assert.strictEqual(oracle.agents['FreshVendor'].interactions, 1);
    });

    it('applies the larger negative delta for a failure', async () => {
        const result = await updateTrustOracle('FlakyVendor', false);
        assert.strictEqual(result.updated, true);

        const oracle = JSON.parse(await safeReadFile(TRUST_ORACLE_PATH)) as { agents: Record<string, { reliability: number }> };
        assert.strictEqual(oracle.agents['FlakyVendor'].reliability, 0.35); // 0.5 - 0.15
    });

    it('blends subsequent outcomes with EMA smoothing', async () => {
        await updateTrustOracle('EmaCorp', true);
        const result = await updateTrustOracle('EmaCorp', false);
        assert.strictEqual(result.updated, true);

        const oracle = JSON.parse(await safeReadFile(TRUST_ORACLE_PATH)) as { agents: Record<string, { reliability: number; interactions: number }> };
        // 0.5 + 0.1 success, then 0.6 + 0.2 * (-0.15) failure
        assert.ok(Math.abs(oracle.agents['EmaCorp'].reliability - 0.57) < 1e-9);
        assert.strictEqual(oracle.agents['EmaCorp'].interactions, 2);
    });

    it('refuses prototype-colliding entity names and stores nothing', async () => {
        const before = await safeReadFile(TRUST_ORACLE_PATH);

        for (const entity of ['__proto__', 'constructor', 'toString']) {
            const result = await updateTrustOracle(entity, true);
            assert.strictEqual(result.updated, false, `${entity} must not report success`);
            assert.ok(result.error, `${entity} must report an error`);
        }

        const after = await safeReadFile(TRUST_ORACLE_PATH);
        assert.strictEqual(after, before, 'refused updates must not touch the oracle file');

        const oracle = JSON.parse(after) as { agents: Record<string, unknown> };
        for (const entity of ['__proto__', 'constructor', 'toString']) {
            assert.ok(!Object.hasOwn(oracle.agents, entity), `${entity} must not be stored`);
        }
    });
});

describe('trust file layout', () => {
    it('writes the oracle as JSON with an agents map', async () => {
        const raw = await fs.readFile(TRUST_ORACLE_PATH, 'utf-8');
        const oracle = JSON.parse(raw) as { agents: Record<string, unknown> };
        assert.ok(typeof oracle.agents === 'object' && oracle.agents !== null);
    });
});
