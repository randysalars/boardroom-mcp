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

// Map decision types to council categories (normalized to lowercase)
const ROUTING_TABLE: Record<string, string[]> = {
    strategy: ['keystone', 'business'],
    marketing: ['marketing', 'ecommerce'],
    product: ['business', 'ecommerce'],
    technology: ['technology'],
    operations: ['business', 'ecommerce'],
    crisis: ['keystone', 'business', 'technology'],
    singularity: ['singularity'],
    ethics: ['keystone', 'singularity'],
    general: ['keystone', 'business'],
};

// Classification rules: [type, keywords, weight-per-keyword]
const CLASSIFICATION_RULES: [string, string[]][] = [
    ['singularity', ['omega', 'singularity', 'agi', 'superintelligence', 'consciousness']],
    ['technology', ['code', 'debug', 'algorithm', 'deploy', 'server', 'api', 'database', 'mcp', 'architecture', 'refactor', 'test', 'ci']],
    ['marketing', ['marketing', 'seo', 'content strategy', 'social media', 'brand', 'audience', 'ads', 'growth', 'campaign', 'funnel']],
    ['product', ['product', 'feature', 'ux', 'design', 'pricing', 'tier', 'launch', 'onboarding', 'user experience']],
    ['crisis', ['crisis', 'emergency', 'breach', 'outage', 'critical', 'urgent', 'incident']],
    ['strategy', ['strategy', 'revenue', 'monetize', 'compete', 'pivot', 'invest', 'roadmap', 'moat', 'acquisition']],
    ['operations', ['process', 'workflow', 'automate', 'optimize', 'pipeline', 'cron', 'devops']],
    ['ethics', ['ethics', 'values', 'moral', 'trust', 'privacy', 'fairness']],
];

/**
 * Score-based classification — matches ALL rules and returns the highest-scoring type.
 * Fixes the order-dependent first-match bug.
 */
function classifyTask(task: string): { type: string; keywords: string[] } {
    const lower = task.toLowerCase();
    const scores: Record<string, number> = {};
    const allMatched: string[] = [];

    for (const [type, keywords] of CLASSIFICATION_RULES) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                score++;
                allMatched.push(kw);
            }
        }
        if (score > 0) {
            scores[type] = (scores[type] || 0) + score;
        }
    }

    // Sort by score descending, pick the best
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0]?.[0] || 'general';
    return { type: primary, keywords: allMatched };
}

/**
 * Parse advisor entries from a seats.md file.
 * Supports both `board_member: Name` and `## Seat N: Name` formats.
 */
function parseAdvisors(content: string): string[] {
    const advisors: string[] = [];
    const memberMatches = content.match(/board_member:\s*(.+)/gi) || [];
    for (const m of memberMatches) {
        advisors.push(m.replace(/board_member:\s*/i, '').trim());
    }
    // Fallback: parse ## Seat N: Name headers
    if (advisors.length === 0) {
        const seatMatches = content.match(/^## Seat \d+:\s*(.+)/gm) || [];
        for (const m of seatMatches) {
            advisors.push(m.replace(/^## Seat \d+:\s*/i, '').trim());
        }
    }
    return advisors;
}

/**
 * Extract advisor details (philosophy, criteria, signature question) from seat content.
 */
function extractAdvisorDetails(content: string, advisorName: string): {
    philosophy: string;
    criteria: string;
    signatureQuestion: string;
    tensionArea: string;
} | null {
    // Find the section for this advisor
    const escapedName = advisorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(
        `(?:board_member:\\s*${escapedName}|## Seat \\d+:\\s*${escapedName})([\\s\\S]*?)(?=board_member:|## Seat \\d+:|$)`,
        'i',
    );
    const match = content.match(sectionRegex);
    if (!match) return null;

    const section = match[1] || '';
    const getField = (label: string): string => {
        const fieldMatch = section.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, 'i'));
        return fieldMatch?.[1]?.trim() || '';
    };

    return {
        philosophy: getField('Core Philosophy'),
        criteria: getField('Decision Criteria'),
        signatureQuestion: getField('Signature Question'),
        tensionArea: getField('Tension Area'),
    };
}

/**
 * Load seats from council directory, with proper fallback to demo.
 * Only falls back to demo when NO full protocol files are installed.
 */
async function loadCouncilSeats(council: string, hasFull: boolean): Promise<{
    advisors: string[];
    content: string;
    source: string;
}> {
    if (hasFull) {
        // Try multiple common paths for the council seats
        const candidates = [
            path.join(MASTERMIND_ROOT, council, 'seats.md'),
            path.join(MASTERMIND_ROOT, 'seats', `${council}.md`),
        ];
        for (const seatsPath of candidates) {
            try {
                const content = await fs.readFile(seatsPath, 'utf-8');
                const advisors = parseAdvisors(content);
                if (advisors.length > 0) {
                    return { advisors, content, source: `full:${council}` };
                }
            } catch {
                continue;
            }
        }
        // Full mode but this specific council not found — return empty, don't pollute with demo
        return { advisors: [], content: '', source: `full:${council}:not-found` };
    }

    // Demo mode — load demo seats
    try {
        const content = await fs.readFile(path.join(DEMO_ROOT, 'seats.md'), 'utf-8');
        const advisors = parseAdvisors(content);
        return { advisors, content, source: 'demo' };
    } catch {
        return { advisors: [], content: '', source: 'demo:not-found' };
    }
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

/**
 * Search Wisdom Codex — flexible format matching.
 * Matches entries starting with `- [`, `- *`, `> `, or any `- ` bullet.
 */
async function findWisdom(query: string, limit: number = 5): Promise<string[]> {
    const wisdom = await safeReadFile(WISDOM_PATH);
    if (!wisdom) return [];

    const lower = query.toLowerCase();
    const keywords = lower.split(/\s+/).filter((w) => w.length > 3);

    const entries = wisdom.split('\n').filter((l) =>
        l.startsWith('- [') || l.startsWith('- *') || l.startsWith('> ') || (l.startsWith('- ') && l.length > 10),
    );
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

        // Load all council seats with proper mode awareness
        const seatResults = await Promise.all(
            councils.map((c) => loadCouncilSeats(c, hasFull)),
        );

        // Deduplicate advisors and collect their details
        const seenAdvisors = new Set<string>();
        const advisorSections: string[] = [];
        let allSeatContent = '';

        for (const result of seatResults) {
            allSeatContent += result.content + '\n';
            for (const advisor of result.advisors) {
                if (!seenAdvisors.has(advisor)) {
                    seenAdvisors.add(advisor);
                    const details = extractAdvisorDetails(result.content, advisor);
                    if (details) {
                        advisorSections.push([
                            `### ${advisor}`,
                            details.philosophy ? `- **Philosophy:** ${details.philosophy}` : '',
                            details.criteria ? `- **Decision Criteria:** ${details.criteria}` : '',
                            details.signatureQuestion ? `- **Signature Question:** ${details.signatureQuestion}` : '',
                            details.tensionArea ? `- **Tension Area:** ${details.tensionArea}` : '',
                        ].filter(Boolean).join('\n'));
                    } else {
                        advisorSections.push(`### ${advisor}`);
                    }
                }
            }
        }

        const advisors = [...seenAdvisors].slice(0, 8);

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

        // Build dynamic tension from advisor seat cards
        const tensions: string[] = [];
        for (const result of seatResults) {
            for (const advisor of result.advisors) {
                const details = extractAdvisorDetails(result.content, advisor);
                if (details?.tensionArea) {
                    tensions.push(`- **${advisor}:** ${details.tensionArea}`);
                }
            }
        }

        const analysis = [
            `# Boardroom Analysis`,
            ``,
            `**Task:** ${task}`,
            `**Classification:** ${classification.type.toUpperCase()}`,
            `**Matched Keywords:** ${classification.keywords.join(', ') || 'none (general routing)'}`,
            `**Councils Invoked:** ${councils.join(', ')}`,
            `**Advisors Available:** ${advisors.length > 0 ? advisors.join(', ') : 'None found for these councils'}`,
            `**Protocol Status:** ${hasFull ? '✅ Full (450+ advisors, 38 councils)' : '⚠️ Demo mode — visit https://salars.net/boardroom for full protocol files'}`,
            ``,
            ...(systemExcerpt ? [`## Governance Framework`, `${systemExcerpt}...`, ``] : []),
            `## Advisor Perspectives`,
            advisorSections.length > 0
                ? advisorSections.join('\n\n')
                : '_No advisor details loaded. Install full protocol files for rich advisor profiles._',
            ``,
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
            tensions.length > 0
                ? `**Advisor tension areas for this analysis:**\n${tensions.join('\n')}`
                : `Based on classification "${classification.type}", consider these tensions:\n- **Short-term gains vs. long-term positioning** — What wins now vs. what compounds\n- **Simplicity vs. completeness** — The minimum viable vs. the full solution`,
            ``,
            `## Next Steps`,
            `1. Consider each advisor's philosophy and decision criteria above`,
            `2. Apply the tension framework — where do the advisors disagree?`,
            `3. Synthesize a verdict that resolves the tensions`,
            `4. Report the outcome with \`report_outcome\` to feed the learning system`,
        ].join('\n');

        return mcpSuccess(analysis);
    } catch (error) {
        return mcpError(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
