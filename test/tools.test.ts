import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Test the tool modules directly
import { analyzeTool } from '../src/tools/analyze.js';
import { checkGovernanceTool } from '../src/tools/governance.js';
import { queryIntelligenceTool } from '../src/tools/intelligence.js';
import { trustLookupTool } from '../src/tools/trust.js';
import { reportOutcomeTool } from '../src/tools/report.js';

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
