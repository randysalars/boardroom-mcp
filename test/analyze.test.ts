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
 * advisors in proper seat-card format — well above the 8-advisor
 * display cap on the Advisors Available line.
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

/** Split the Mandatory Tension Framework advisor list out of an analysis. */
function tensionAdvisorBlock(text: string): string {
    return text
        .split('**Advisor tension areas for this analysis:**')[1]
        ?.split('## Next Steps')[0] ?? '';
}

describe('analyze advisor sections (audit finding 7)', () => {
    it('gives every unique advisor a section and a tension line — sections and tensions stay on the same set', async () => {
        await seedFullModeCouncils();

        const result = await analyzeTool(CRISIS_TASK);
        const text = result.content[0].text;
        assert.ok(text.includes('Protocol Status:** ✅ Full'), 'fixture must engage full mode');

        const perspectives = text
            .split('## Advisor Perspectives')[1]
            ?.split('## Relevant Precedents')[0] ?? '';
        const heads = perspectives.match(/^### .+$/gm) ?? [];

        // 6 keystone + 7 business advisors — every unique advisor gets a section.
        assert.strictEqual(heads.length, 13, `expected 13 advisor sections, got ${heads.length}`);
        assert.ok(perspectives.includes('### Business Advisor 03'), 'advisors beyond the name cap must still get sections');

        const tensionBlock = tensionAdvisorBlock(text);
        const tensionNames = Array.from(tensionBlock.matchAll(/^- \*\*(.+?):\*\*/gm), (m) => m[1]);
        assert.strictEqual(tensionNames.length, 13, `expected 13 tension lines, got ${tensionNames.length}`);

        // Consistency: every tension advisor also has a section.
        const sectionNames = new Set(heads.map((h) => h.replace(/^### /, '')));
        for (const name of tensionNames) {
            assert.ok(sectionNames.has(name), `tension advisor "${name}" must have a section`);
        }
    });

    it('caps only the Advisors Available name list at 8', async () => {
        await seedFullModeCouncils();

        const result = await analyzeTool(CRISIS_TASK);
        const header = result.content[0].text
            .split('**Advisors Available:**')[1]
            ?.split('\n')[0] ?? '';

        const named = header.trim().split(', ');
        assert.strictEqual(named.length, 8, `expected 8 named advisors, got ${named.length}`);
        assert.strictEqual(named[0], 'Keystone Advisor 01', 'first-seen advisors are named first');
        assert.ok(!header.includes('Business Advisor 03'), 'advisors beyond the cap are not named');
    });

    it('extracts each advisor exactly once with parsed details', async () => {
        await seedFullModeCouncils();

        const result = await analyzeTool(CRISIS_TASK);
        const perspectives = result.content[0].text
            .split('## Advisor Perspectives')[1]
            ?.split('## Relevant Precedents')[0] ?? '';

        assert.strictEqual((perspectives.match(/### Keystone Advisor 01/g) ?? []).length, 1);
        assert.ok(
            perspectives.includes('- **Philosophy:** Keystone Advisor 01 weighs long-term value over short-term noise.'),
            'advisors must carry their parsed seat-card details',
        );
    });
});
