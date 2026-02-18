/**
 * governance tool — Task classification + advisor routing.
 *
 * Uses the shared classifyTask and classifySeverity from utils.ts
 * to ensure consistent routing with the analyze tool.
 */

import {
    classifyTask,
    classifySeverity,
    COUNCIL_ROUTING,
    mcpSuccess,
    mcpError,
} from '../utils.js';

export async function checkGovernanceTool(task: string) {
    try {
        const severity = classifySeverity(task);
        const classification = classifyTask(task);
        const routing = COUNCIL_ROUTING[classification.type] || COUNCIL_ROUTING.general;

        const severityEmoji = severity === 'critical' ? '🔴' : severity === 'standard' ? '🟡' : '🟢';

        const result = [
            `# Governance Check`,
            ``,
            `**Task:** ${task}`,
            `**Classification:** ${classification.type.toUpperCase()}`,
            `**Matched Keywords:** ${classification.keywords.join(', ') || 'none'}`,
            `**Severity:** ${severityEmoji} ${severity.toUpperCase()}`,
            `**Councils:** ${routing.councils.join(', ')}`,
            `**Routing Reason:** ${routing.reason}`,
            ``,
            `## Recommendation`,
            severity === 'critical'
                ? '⚠️ **Full boardroom session required.** Use `analyze()` for multi-advisor debate with mandatory tension. Critical decisions require the Debate Protocol and CEO Synthesis.'
                : severity === 'standard'
                    ? '📋 **Standard review recommended.** Use `analyze()` for structured advice. Check `query_intelligence()` for precedents.'
                    : '✅ **Routine — proceed with confidence.** Quick check complete. Use `query_intelligence()` if you want precedent matches.',
        ].join('\n');

        return mcpSuccess(result);
    } catch (error) {
        return mcpError(`Governance check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
