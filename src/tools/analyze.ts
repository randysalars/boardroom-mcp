/**
 * analyze tool — Full Boardroom consultation.
 *
 * Routes questions to relevant councils, loads advisors and precedents,
 * and builds a structured analysis with mandatory tension framework.
 */

import fs from 'fs/promises';
import path from 'path';
import {
    MASTERMIND_ROOT,
    DEMO_ROOT,
    LEDGER_PATH,
    WISDOM_PATH,
    safeReadFile,
    hasProtocolFiles,
    mcpSuccess,
    mcpError,
} from '../utils.js';

// Map decision types to council categories
const ROUTING_TABLE: Record<string, string[]> = {
    strategy: ['keystone', 'business'],
    marketing: ['marketing'],
    product: ['ecommerce', 'business'],
    technology: ['technology'],
    operations: ['business', 'ecommerce'],
    crisis: ['keystone', 'business', 'technology'],
    singularity: ['singularity'],
    general: ['keystone', 'business'],
};

// Simple keyword-based classification
function classifyTask(task: string): { type: string; keywords: string[] } {
    const lower = task.toLowerCase();
    const matches: string[] = [];

    const rules: [string, string[]][] = [
        ['singularity', ['omega', 'singularity', 'future', 'agi', 'superintelligence', 'consciousness']],
        ['technology', ['code', 'debug', 'algorithm', 'deploy', 'server', 'api', 'database', 'mcp', 'build']],
        ['marketing', ['marketing', 'seo', 'content', 'social', 'brand', 'audience', 'ads', 'growth']],
        ['product', ['product', 'feature', 'ux', 'design', 'pricing', 'tier', 'launch']],
        ['crisis', ['crisis', 'emergency', 'breach', 'outage', 'critical', 'urgent']],
        ['strategy', ['strategy', 'revenue', 'monetize', 'compete', 'pivot', 'invest', 'roadmap']],
        ['operations', ['process', 'workflow', 'automate', 'optimize', 'pipeline', 'cron']],
    ];

    for (const [type, keywords] of rules) {
        const found = keywords.filter((k) => lower.includes(k));
        if (found.length > 0) {
            matches.push(type);
        }
    }

    const primary = matches[0] || 'general';
    return { type: primary, keywords: matches };
}

// Load available seat files from a council directory
async function loadCouncilSeats(council: string): Promise<string[]> {
    // Try full protocol files first, fall back to demo
    const paths = [
        path.join(MASTERMIND_ROOT, council, 'seats.md'),
        path.join(DEMO_ROOT, 'seats.md'),
    ];

    for (const seatsPath of paths) {
        try {
            const content = await fs.readFile(seatsPath, 'utf-8');
            const memberMatches = content.match(/board_member:\s*(.+)/gi) || [];
            if (memberMatches.length > 0) {
                return memberMatches.map((m) => m.replace(/board_member:\s*/i, '').trim());
            }
        } catch {
            continue;
        }
    }
    return [];
}

// Search the LEDGER for precedents
async function findPrecedents(query: string, limit: number = 5): Promise<string[]> {
    const ledger = await safeReadFile(LEDGER_PATH);
    if (!ledger) return [];

    const lower = query.toLowerCase();
    const keywords = lower.split(/\s+/).filter((w) => w.length > 3);

    const sessions = ledger.split(/^## /m).slice(1);
    const scored = sessions
        .map((session) => {
            const sessionLower = session.toLowerCase();
            const score = keywords.reduce(
                (acc, kw) => acc + (sessionLower.includes(kw) ? 1 : 0),
                0,
            );
            const title = session.split('\n')[0]?.trim() || 'Untitled';
            return { title, score, excerpt: session.substring(0, 300) };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored.map((s) => `### ${s.title}\n${s.excerpt}...`);
}

// Search Wisdom Codex
async function findWisdom(query: string, limit: number = 5): Promise<string[]> {
    const wisdom = await safeReadFile(WISDOM_PATH);
    if (!wisdom) return [];

    const lower = query.toLowerCase();
    const keywords = lower.split(/\s+/).filter((w) => w.length > 3);

    const entries = wisdom.split('\n').filter((l) => l.startsWith('- ['));
    return entries
        .filter((entry) => {
            const entryLower = entry.toLowerCase();
            return keywords.some((kw) => entryLower.includes(kw));
        })
        .slice(0, limit);
}

export async function analyzeTool(task: string) {
    try {
        const hasFull = await hasProtocolFiles();
        const classification = classifyTask(task);
        const councils = ROUTING_TABLE[classification.type] || ROUTING_TABLE['general'];

        const advisorPromises = councils.map((c) => loadCouncilSeats(c));
        const advisorLists = await Promise.all(advisorPromises);
        const advisors = [...new Set(advisorLists.flat())].slice(0, 8);

        const [precedents, wisdomEntries] = await Promise.all([
            findPrecedents(task, 5),
            findWisdom(task, 5),
        ]);

        // Load system prompt if available
        let systemExcerpt = '';
        if (hasFull) {
            const systemPrompt = await safeReadFile(
                path.join(MASTERMIND_ROOT, 'SYSTEM_PROMPT.md'),
            );
            systemExcerpt = systemPrompt.substring(0, 500);
        }

        const analysis = [
            `# Boardroom Analysis`,
            ``,
            `**Task:** ${task}`,
            `**Classification:** ${classification.type.toUpperCase()}`,
            `**Councils Invoked:** ${councils.join(', ')}`,
            `**Advisors Available:** ${advisors.length > 0 ? advisors.join(', ') : 'Demo Council (install full protocol files for 450+ advisors)'}`,
            `**Protocol Status:** ${hasFull ? '✅ Full (450+ advisors, 38 councils)' : '⚠️ Demo mode — visit https://salars.net/boardroom for full protocol files'}`,
            ``,
            ...(systemExcerpt ? [`## Governance Framework`, `${systemExcerpt}...`, ``] : []),
            `## Relevant Precedents (${precedents.length} found)`,
            precedents.length > 0
                ? precedents.join('\n\n')
                : '_No directly relevant precedents in the LEDGER._',
            ``,
            `## Relevant Wisdom (${wisdomEntries.length} entries)`,
            wisdomEntries.length > 0
                ? wisdomEntries.join('\n')
                : '_No matching wisdom codex entries._',
            ``,
            `## Mandatory Tension Framework`,
            `The Boardroom requires identifying at least TWO conflicting truths before synthesis.`,
            `Based on classification "${classification.type}", consider tensions between:`,
            classification.type === 'strategy'
                ? '- **Speed vs. Quality** — Ship fast to capture market vs. build properly to retain trust'
                : classification.type === 'technology'
                    ? '- **Simplicity vs. Capability** — Minimal viable vs. fully featured'
                    : classification.type === 'marketing'
                        ? '- **Reach vs. Depth** — Broad audience vs. deep engagement'
                        : '- **Risk vs. Reward** — Conservative execution vs. bold experimentation',
            ``,
            `## Next Steps`,
            `1. Consider each advisor's domain expertise`,
            `2. Apply the Mandatory Tension framework`,
            `3. Synthesize into a verdict`,
            `4. Report the outcome with \`report_outcome\` to feed the learning system`,
        ].join('\n');

        return mcpSuccess(analysis);
    } catch (error) {
        return mcpError(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
