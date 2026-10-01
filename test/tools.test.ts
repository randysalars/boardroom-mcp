// Isolation must come first: src modules resolve their data paths from env
// at import time, and static imports evaluate in declaration order.
import './helpers/env.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Test the tool modules directly
import { analyzeTool } from '../src/tools/analyze.js';
import { checkGovernanceTool } from '../src/tools/governance.js';
import { queryIntelligenceTool } from '../src/tools/intelligence.js';
import { trustLookupTool } from '../src/tools/trust.js';
import { reportOutcomeTool } from '../src/tools/report.js';
import { LEDGER_PATH } from '../src/utils.js';

/** Append `count` vendor-keyword sessions to the (isolated) LEDGER. */
async function seedLedgerWithSessions(count: number): Promise<void> {
    let ledger = '';
    for (let i = 0; i < count; i += 1) {
        ledger += `\n\n## Vendor Session ${String(i).padStart(3, '0')}\n**Task:** evaluate vendor ${i}\n**Outcome:** approved\n---`;
    }
    await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
    await fs.writeFile(LEDGER_PATH, ledger, 'utf-8');
}

/** Read the LEDGER match count out of the result header. */
function ledgerMatchCount(text: string): number {
    const section = text.split('## LEDGER Matches (')[1]?.split(')')[0] ?? '0';
    return Number(section);
}

/**
 * Basic smoke tests for each of the 5 MCP tools.
 * These verify that each tool:
 * 1. Returns successfully (no throw)
 * 2. Returns an object with `content` array
 * 3. Content contains at least one text entry
 * 4. The text is a non-empty string
 */

describe('analyze tool', () => {
    it('returns structured markdown for a simple question', async () => {
        const result = await analyzeTool('Should I use TypeScript or JavaScript?');
        assert.ok(result, 'result should exist');
        assert.ok(Array.isArray(result.content), 'content should be an array');
        assert.ok(result.content.length > 0, 'content should have entries');
        const text = result.content[0].text;
        assert.ok(typeof text === 'string' && text.length > 0, 'text should be non-empty');
        assert.ok(text.includes('Boardroom'), 'should contain Boardroom header');
    });
});

describe('check_governance tool', () => {
    it('returns governance classification for a task', async () => {
        const result = await checkGovernanceTool('Deploy to production on Friday evening');
        assert.ok(result, 'result should exist');
        assert.ok(Array.isArray(result.content), 'content should be an array');
        const text = result.content[0].text;
        assert.ok(typeof text === 'string' && text.length > 0, 'text should be non-empty');
        assert.ok(text.includes('Governance'), 'should contain Governance header');
    });
});

describe('query_intelligence tool', () => {
    it('returns intelligence report for a query', async () => {
        const result = await queryIntelligenceTool('pricing strategy', 5);
        assert.ok(result, 'result should exist');
        assert.ok(Array.isArray(result.content), 'content should be an array');
        const text = result.content[0].text;
        assert.ok(typeof text === 'string' && text.length > 0, 'text should be non-empty');
        assert.ok(text.includes('Intelligence'), 'should contain Intelligence header');
    });

    it('defaults to 10 results per source when the limit is omitted', async () => {
        await seedLedgerWithSessions(15);
        const result = await queryIntelligenceTool('vendor');
        assert.strictEqual(ledgerMatchCount(result.content[0].text), 10);
    });

    it('clamps oversized limits from direct callers to 50', async () => {
        await seedLedgerWithSessions(60);
        const result = await queryIntelligenceTool('vendor', 60);
        assert.strictEqual(ledgerMatchCount(result.content[0].text), 50);
    });

    it('clamps invalid limits to at least one result', async () => {
        await seedLedgerWithSessions(5);
        for (const bad of [0, -5, 1.9]) {
            const result = await queryIntelligenceTool('vendor', bad);
            assert.strictEqual(ledgerMatchCount(result.content[0].text), 1, `limit ${bad} must yield one result`);
        }
    });
});

describe('trust_lookup tool', () => {
    it('returns trust profile for an unknown entity', async () => {
        const result = await trustLookupTool('TestEntity_12345');
        assert.ok(result, 'result should exist');
        assert.ok(Array.isArray(result.content), 'content should be an array');
        const text = result.content[0].text;
        assert.ok(typeof text === 'string' && text.length > 0, 'text should be non-empty');
        assert.ok(text.includes('Trust Lookup'), 'should contain Trust Lookup header');
        assert.ok(text.includes('Unknown'), 'unknown entity should be flagged');
    });
});

describe('report_outcome tool', () => {
    it('returns outcome confirmation', async () => {
        const result = await reportOutcomeTool(
            'Test decision for smoke test',
            'Test outcome — verified tool works',
            true,
        );
        assert.ok(result, 'result should exist');
        assert.ok(Array.isArray(result.content), 'content should be an array');
        const text = result.content[0].text;
        assert.ok(typeof text === 'string' && text.length > 0, 'text should be non-empty');
        assert.ok(text.includes('Outcome Recorded'), 'should contain Outcome header');
    });
});
