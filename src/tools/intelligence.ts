/**
 * intelligence tool — Search LEDGER and Wisdom Codex.
 */

import { LEDGER_PATH, WISDOM_PATH, safeReadFile, mcpSuccess, mcpError } from '../utils.js';

export async function queryIntelligenceTool(query: string, limit: number = 10) {
    try {
        const [ledger, wisdom] = await Promise.all([
            safeReadFile(LEDGER_PATH),
            safeReadFile(WISDOM_PATH),
        ]);

        const lower = query.toLowerCase();
        const keywords = lower.split(/\s+/).filter((w) => w.length > 3);

        // Search LEDGER sessions
        const sessions = ledger ? ledger.split(/^## /m).slice(1) : [];
        const matchedSessions = sessions
            .map((session) => {
                const sessionLower = session.toLowerCase();
                const score = keywords.reduce(
                    (acc, kw) => acc + (sessionLower.includes(kw) ? 1 : 0),
                    0,
                );
                const title = session.split('\n')[0]?.trim() || 'Untitled';
                return { title, score, excerpt: session.substring(0, 400) };
            })
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        // Search Wisdom Codex
        const wisdomLines = wisdom ? wisdom.split('\n').filter((l) => l.startsWith('- [')) : [];
        const matchedWisdom = wisdomLines
            .filter((entry) => {
                const entryLower = entry.toLowerCase();
                return keywords.some((kw) => entryLower.includes(kw));
            })
            .slice(0, limit);

        const result = [
            `# Intelligence Query Results`,
            ``,
            `**Query:** "${query}"`,
            `**Keywords:** ${keywords.join(', ')}`,
            ``,
            `## LEDGER Matches (${matchedSessions.length})`,
            matchedSessions.length > 0
                ? matchedSessions.map((s) => `### ${s.title}\n${s.excerpt}...`).join('\n\n')
                : '_No matching LEDGER entries. The LEDGER grows with every `report_outcome()` call._',
            ``,
            `## Wisdom Codex Matches (${matchedWisdom.length})`,
            matchedWisdom.length > 0
                ? matchedWisdom.join('\n')
                : '_No matching wisdom entries._',
        ].join('\n');

        return mcpSuccess(result);
    } catch (error) {
        return mcpError(`Intelligence query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
