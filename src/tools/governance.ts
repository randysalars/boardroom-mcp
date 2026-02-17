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
    technology: { councils: ['Technology', 'AI & Robotics'], reason: 'Technical decision' },
    strategy: { councils: ['Business', 'Keystone'], reason: 'Strategic decision' },
    marketing: { councils: ['Marketing', 'E-commerce'], reason: 'Marketing & growth' },
    product: { councils: ['Business', 'E-commerce'], reason: 'Product decision' },
    crisis: { councils: ['Keystone', 'Business', 'Technology'], reason: 'Crisis response' },
    ethics: { councils: ['Keystone', 'Singularity'], reason: 'Ethics & values' },
    general: { councils: ['Business', 'Keystone'], reason: 'General decision' },
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
    const techWords = ['code', 'api', 'server', 'deploy', 'database', 'debug', 'build'];
    const stratWords = ['strategy', 'revenue', 'compete', 'roadmap', 'invest'];
    const marketWords = ['marketing', 'seo', 'content', 'ads', 'growth', 'social'];
    const crisisWords = ['crisis', 'emergency', 'outage', 'breach'];

    if (crisisWords.some((w) => lower.includes(w))) return COUNCIL_ROUTING.crisis;
    if (techWords.some((w) => lower.includes(w))) return COUNCIL_ROUTING.technology;
    if (stratWords.some((w) => lower.includes(w))) return COUNCIL_ROUTING.strategy;
    if (marketWords.some((w) => lower.includes(w))) return COUNCIL_ROUTING.marketing;
    return COUNCIL_ROUTING.general;
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
