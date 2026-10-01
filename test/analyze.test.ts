// Isolation must come first: src modules resolve their data paths from env
// at import time, and static imports evaluate in declaration order.
import './helpers/env.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { analyzeTool } from '../src/tools/analyze.js';
import { MASTERMIND_ROOT } from '../src/utils.js';

const CRISIS_TASK = 'Crisis: security breach in the payment pipeline, must respond now';

/**
 * Seed full-protocol fixtures: SYSTEM_PROMPT.md plus seats/ files so
 * hasProtocolFiles() engages full mode. Two councils with 13 unique
 * advisors in proper seat-card format — well above the 8-advisor cap.
 */
async function seedFullModeCouncils(): Promise<void> {
    await fs.mkdir(path.join(MASTERMIND_ROOT, 'seats'), { recursive: true });
    await fs.writeFile(
        path.join(MASTERMIND_ROOT, 'SYSTEM_PROMPT.md'),
        '# System Prompt\nDeliberate with rigor.',
        'utf-8',
    );

    const seatCard = (name: string) => [
        `board_member: ${name}`,
        `**Core Philosophy:** ${name} weighs long-term value over short-term noise.`,
        `**Decision Criteria:** Evidence, second-order effects, reversibility.`,
        `**Signature Question:** What would make this decision obviously right in a year?`,
        `**Tension Area:** ${name} pushes back on speed at the expense of durability.`,
        '',
    ].join('\n');

    const councilFile = (title: string, names: string[]) =>
        [title, ...names.map(seatCard)].join('\n');

    await fs.writeFile(
        path.join(MASTERMIND_ROOT, 'seats', 'keystone.md'),
        councilFile('Keystone Seats', Array.from({ length: 6 }, (_, i) => `Keystone Advisor 0${i + 1}`)),
        'utf-8',
    );
    await fs.writeFile(
        path.join(MASTERMIND_ROOT, 'seats', 'business.md'),
        councilFile('Business Seats', Array.from({ length: 7 }, (_, i) => `Business Advisor 0${i + 1}`)),
        'utf-8',
    );
}

describe('analyze advisor cap (audit finding 7)', () => {
    it('builds sections for at most 8 advisors even with 13 available', async () => {
        await seedFullModeCouncils();

        const result = await analyzeTool(CRISIS_TASK);
        const text = result.content[0].text;
        assert.ok(text.includes('Protocol Status:** ✅ Full'), 'fixture must engage full mode');

        const perspectives = text
            .split('## Advisor Perspectives')[1]
            ?.split('## Relevant Precedents')[0] ?? '';
        const heads = perspectives.match(/^### .+$/gm) ?? [];

        // 6 keystone + 7 business advisors, capped to 8 in first-seen order.
        assert.strictEqual(heads.length, 8, `expected 8 advisor sections, got ${heads.length}`);
        for (const beyond of ['Business Advisor 03', 'Business Advisor 04', 'Business Advisor 05', 'Business Advisor 06', 'Business Advisor 07']) {
            assert.ok(!perspectives.includes(`### ${beyond}`), `${beyond} must have no section beyond the cap`);
        }
        assert.ok(!text.split('## Advisor Perspectives')[0].includes('Business Advisor 03'), 'Advisors Available must also be capped');
    });

    it('extracts each capped advisor exactly once with parsed details', async () => {
        await seedFullModeCouncils();

        const result = await analyzeTool(CRISIS_TASK);
        const perspectives = result.content[0].text
            .split('## Advisor Perspectives')[1]
            ?.split('## Relevant Precedents')[0] ?? '';

        assert.strictEqual((perspectives.match(/### Keystone Advisor 01/g) ?? []).length, 1);
        assert.ok(
            perspectives.includes('- **Philosophy:** Keystone Advisor 01 weighs long-term value over short-term noise.'),
            'capped advisors must carry their parsed seat-card details',
        );
    });
});
