/**
 * governance tool — Task classification + severity routing.
 *
 * Uses shared classification and severity logic from `utils.ts`
 * to ensure consistent routing with the `analyze` tool.
 *
 * @module tools/governance
 */

import {
    classifyTask,
    classifySeverity,
    COUNCIL_ROUTING,
    mcpSuccess,
    mcpError,
} from '../utils.js';
import type { McpToolResponse } from '../types.js';

/** Map severity levels to display emoji. */
const SEVERITY_EMOJI: Record<string, string> = {
    critical: '🔴',
    standard: '🟡',
    routine: '🟢',
};

/**
 * Classify a task and determine governance routing.
 *
 * @param task - The task or decision to classify.
 * @returns MCP response with classification, severity, and recommended action.
 */
export async function checkGovernanceTool(task: string): Promise<McpToolResponse> {
    try {
        const severity = classifySeverity(task);
        const classification = classifyTask(task);
        const routing = COUNCIL_ROUTING[classification.type] || COUNCIL_ROUTING.general;
        const emoji = SEVERITY_EMOJI[severity] || '🟢';

        const result = [
            `# Governance Check`,
            ``,
            `**Task:** ${task}`,
            `**Classification:** ${classification.type.toUpperCase()}`,
            `**Matched Keywords:** ${classification.keywords.join(', ') || 'none'}`,
            `**Severity:** ${emoji} ${severity.toUpperCase()}`,
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
