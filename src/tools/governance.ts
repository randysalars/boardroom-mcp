/**
 * governance tool — Task classification + advisor routing.
 */

import { mcpSuccess, mcpError } from '../utils.js';

const SEVERITY_KEYWORDS: Record<string, string[]> = {
    critical: ['irreversible', 'delete', 'payment', 'security', 'breach', 'fire', 'legal'],
    standard: ['strategy', 'architecture', 'roadmap', 'partnership', 'pricing'],
    routine: ['bug', 'style', 'refactor', 'docs', 'config'],
};

const COUNCIL_ROUTING: Record<string, { councils: string[]; reason: string }> = {
    technology: { councils: ['Technology'], reason: 'Technical decision' },
    strategy: { councils: ['Keystone', 'Business'], reason: 'Strategic decision' },
    marketing: { councils: ['Marketing', 'E-commerce'], reason: 'Marketing & growth' },
    product: { councils: ['Business', 'E-commerce'], reason: 'Product decision' },
    crisis: { councils: ['Keystone', 'Business', 'Technology'], reason: 'Crisis response' },
    ethics: { councils: ['Keystone', 'Singularity'], reason: 'Ethics & values' },
    operations: { councils: ['Business', 'E-commerce'], reason: 'Operations & workflow' },
    general: { councils: ['Keystone', 'Business'], reason: 'General decision' },
};

function classifySeverity(task: string): string {
    const lower = task.toLowerCase();
    for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) return severity;
    }
    return 'routine';
}

function routeToCouncils(task: string): { councils: string[]; reason: string } {
    const lower = task.toLowerCase();

    // Score-based routing — same pattern as analyze.ts
    const rules: [string, string[]][] = [
        ['crisis', ['crisis', 'emergency', 'outage', 'breach', 'incident']],
        ['technology', ['code', 'api', 'server', 'deploy', 'database', 'debug', 'architecture', 'refactor']],
        ['strategy', ['strategy', 'revenue', 'compete', 'roadmap', 'invest', 'moat', 'pivot']],
        ['marketing', ['marketing', 'seo', 'content strategy', 'ads', 'growth', 'social media', 'campaign']],
        ['product', ['product', 'feature', 'ux', 'design', 'pricing', 'launch', 'onboarding']],
        ['ethics', ['ethics', 'values', 'moral', 'trust', 'privacy']],
        ['operations', ['process', 'workflow', 'automate', 'optimize', 'pipeline', 'cron']],
    ];

    const scores: Record<string, number> = {};
    for (const [type, keywords] of rules) {
        const score = keywords.filter((kw) => lower.includes(kw)).length;
        if (score > 0) scores[type] = score;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const best = sorted[0]?.[0] || 'general';
    return COUNCIL_ROUTING[best] || COUNCIL_ROUTING.general;
}

export async function checkGovernanceTool(task: string) {
    try {
        const severity = classifySeverity(task);
        const routing = routeToCouncils(task);

        const severityEmoji = severity === 'critical' ? '🔴' : severity === 'standard' ? '🟡' : '🟢';

        const result = [
            `# Governance Check`,
            ``,
            `**Task:** ${task}`,
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
