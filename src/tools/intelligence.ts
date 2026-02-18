/**
 * intelligence tool — Search LEDGER and Wisdom Codex.
 *
 * Uses shared keyword extraction and wisdom parsing from `utils.ts`
 * for consistent search behavior across all tools.
 *
 * @module tools/intelligence
 */

import {
    LEDGER_PATH,
    WISDOM_PATH,
    safeReadFile,
    extractKeywords,
    parseWisdomEntries,
    mcpSuccess,
    mcpError,
} from '../utils.js';
import type { McpToolResponse } from '../types.js';

/** Maximum excerpt length for LEDGER session previews. */
const SESSION_EXCERPT_LENGTH = 400;

/**
 * Search institutional memory for relevant precedents and wisdom.
 *
 * @param query - Search query — topic, keyword, or question.
 * @param limit - Maximum number of results per source (default: 10).
 * @returns MCP response with matched LEDGER sessions and Wisdom entries.
 */
export async function queryIntelligenceTool(query: string, limit: number = 10): Promise<McpToolResponse> {
    try {
        const [ledger, wisdom] = await Promise.all([
            safeReadFile(LEDGER_PATH),
            safeReadFile(WISDOM_PATH),
        ]);

        const { keywords, allFiltered } = extractKeywords(query);

        // Warn if all keywords were too short to be useful
        if (allFiltered) {
            const result = [
                `# Intelligence Query Results`,
                ``,
                `**Query:** "${query}"`,
                ``,
                `⚠️ **All query words were too short to search** (≤ 2 characters).`,
                `Try a more specific query with longer terms for better results.`,
            ].join('\n');
            return mcpSuccess(result);
        }

        // Search LEDGER sessions by keyword score
        const sessions = ledger ? ledger.split(/^## /m).slice(1) : [];
        const matchedSessions = sessions
            .map((session) => {
                const sessionLower = session.toLowerCase();
                const score = keywords.reduce(
                    (acc, kw) => acc + (sessionLower.includes(kw) ? 1 : 0),
                    0,
                );
                const title = session.split('\n')[0]?.trim() || 'Untitled';
                return { title, score, excerpt: session.substring(0, SESSION_EXCERPT_LENGTH) };
            })
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        // Search Wisdom Codex using shared parser
        const wisdomEntries = parseWisdomEntries(wisdom);
        const matchedWisdom = wisdomEntries
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
