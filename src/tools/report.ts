/**
 * report tool — Log decision outcomes for the learning system.
 *
 * Now also updates the Trust Oracle when an entity is mentioned,
 * closing the feedback loop between report_outcome → trust_lookup.
 */

import fs from 'fs/promises';
import path from 'path';
import { LEDGER_PATH, now, updateTrustOracle, mcpSuccess, mcpError } from '../utils.js';

export async function reportOutcomeTool(
    task: string,
    outcome: string,
    followedRecommendation: boolean = true,
    entity?: string,
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
            ...(entity ? [`**Entity:** ${entity}`] : []),
            `**Timestamp:** ${timestamp}`,
            ``,
            `---`,
        ].join('\n');

        // Attempt to append to LEDGER — track success
        let persisted = false;
        let writeError = '';
        try {
            // Ensure the directory exists
            await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
            await fs.appendFile(LEDGER_PATH, entry, 'utf-8');
            persisted = true;
        } catch (err) {
            writeError = err instanceof Error ? err.message : String(err);
        }

        // Update Trust Oracle if an entity was specified
        let trustUpdated = false;
        let trustError = '';
        if (entity) {
            // Infer success: positive outcomes when recommendation was followed,
            // or explicitly positive language in the outcome.
            const outcomePositive = followedRecommendation &&
                !outcome.toLowerCase().match(/\b(fail|broke|error|crash|wrong|bad|lost)\b/);
            const trustResult = await updateTrustOracle(entity, outcomePositive);
            trustUpdated = trustResult.updated;
            trustError = trustResult.error || '';
        }

        const result = [
            `# Outcome Recorded`,
            ``,
            persisted
                ? `${emoji} Decision outcome has been logged to the Knowledge Flywheel.`
                : `⚠️ Decision outcome was captured but **could not be written to disk** (${writeError}). The LEDGER at \`${LEDGER_PATH}\` may not exist or is not writable. The outcome is shown below but will not persist across sessions.`,
            ``,
            `**Task:** ${task}`,
            `**Outcome:** ${outcome}`,
            `**Followed Recommendation:** ${followedRecommendation ? 'Yes' : 'No'}`,
            `**Logged At:** ${timestamp}`,
            `**Persisted:** ${persisted ? 'Yes ✅' : 'No ⚠️'}`,
            ...(entity ? [
                ``,
                `## Trust Oracle Update`,
                trustUpdated
                    ? `✅ Trust profile for **${entity}** has been updated. Use \`trust_lookup("${entity}")\` to see the current profile.`
                    : `⚠️ Trust profile for **${entity}** could not be updated${trustError ? ` (${trustError})` : ''}.`,
            ] : []),
            ``,
            persisted
                ? `This outcome will be used to improve future Boardroom recommendations.`
                : `To enable persistence, create the directory: \`mkdir -p ${path.dirname(LEDGER_PATH)}\``,
            `Use \`query_intelligence()\` to search past outcomes as precedents.`,
        ].join('\n');

        return mcpSuccess(result);
    } catch (error) {
        return mcpError(`Outcome report failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
