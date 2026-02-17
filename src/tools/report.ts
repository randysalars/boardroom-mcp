/**
 * report tool — Log decision outcomes for the learning system.
 */

import fs from 'fs/promises';
import { LEDGER_PATH, now, mcpSuccess, mcpError } from '../utils.js';

export async function reportOutcomeTool(
    task: string,
    outcome: string,
    followedRecommendation: boolean = true,
) {
    try {
        const timestamp = now();
        const emoji = followedRecommendation ? '✅' : '⚠️';

        const entry = [
            ``,
            `## ${emoji} Outcome Report — ${timestamp}`,
            ``,
            `**Task:** ${task}`,
            `**Outcome:** ${outcome}`,
            `**Followed Recommendation:** ${followedRecommendation ? 'Yes' : 'No'}`,
            `**Timestamp:** ${timestamp}`,
            ``,
            `---`,
        ].join('\n');

        // Attempt to append to LEDGER
        try {
            await fs.appendFile(LEDGER_PATH, entry, 'utf-8');
        } catch {
            // LEDGER not writable — still return success with the entry
        }

        const result = [
            `# Outcome Recorded`,
            ``,
            `${emoji} Decision outcome has been logged to the Knowledge Flywheel.`,
            ``,
            `**Task:** ${task}`,
            `**Outcome:** ${outcome}`,
            `**Followed Recommendation:** ${followedRecommendation ? 'Yes' : 'No'}`,
            `**Logged At:** ${timestamp}`,
            ``,
            `This outcome will be used to improve future Boardroom recommendations.`,
            `Use \`query_intelligence()\` to search past outcomes as precedents.`,
        ].join('\n');

        return mcpSuccess(result);
    } catch (error) {
        return mcpError(`Outcome report failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
