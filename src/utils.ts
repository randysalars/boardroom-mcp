/**
 * Shared utilities for the Boardroom MCP Server.
 * Handles file I/O for LEDGER, Wisdom Codex, and boardroom filesystem.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Configurable Paths ──────────────────────────────────────────
// Users can set BOARDROOM_ROOT to point to their protocol files directory.
// Default: ~/.ai/boardroom
const HOME = process.env.HOME || process.env.USERPROFILE || '/home/user';

export const BOARDROOM_ROOT = process.env.BOARDROOM_ROOT
    || path.join(HOME, '.ai/boardroom');

export const MASTERMIND_ROOT = path.join(BOARDROOM_ROOT, 'mastermind');
export const LEDGER_PATH = path.join(BOARDROOM_ROOT, 'LEDGER.md');
export const WISDOM_PATH = path.join(MASTERMIND_ROOT, 'BOARD_WISDOM.md');
export const LEDGER_JSON_PATH = path.join(MASTERMIND_ROOT, 'boardroom_ledger.json');

export const TRUST_ORACLE_PATH = process.env.BOARDROOM_TRUST_PATH
    || path.join(HOME, '.boardroom/trust-oracle.json');

// Demo council path (included with the package)
// Uses fileURLToPath for cross-platform compatibility (fixes Windows path issue)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEMO_ROOT = path.join(__dirname, '../demo');

/**
 * Safely read a file, returning empty string on failure.
 */
export async function safeReadFile(filePath: string): Promise<string> {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch {
        return '';
    }
}

/**
 * Safely parse JSON, returning null on failure.
 */
export function safeParseJSON<T>(content: string): T | null {
    try {
        return JSON.parse(content) as T;
    } catch {
        return null;
    }
}

/**
 * Format an MCP tool success response.
 */
export function mcpSuccess(text: string) {
    return { content: [{ type: 'text' as const, text }] };
}

/**
 * Format an MCP tool error response.
 */
export function mcpError(text: string) {
    return { content: [{ type: 'text' as const, text: `❌ ${text}` }], isError: true as const };
}

/**
 * Get the current ISO timestamp.
 */
export function now(): string {
    return new Date().toISOString();
}

/**
 * Check if the full protocol files are installed.
 * Checks for SYSTEM_PROMPT.md AND at least one council directory to avoid
 * false positives from partial installs.
 */
export async function hasProtocolFiles(): Promise<boolean> {
    try {
        await fs.access(path.join(MASTERMIND_ROOT, 'SYSTEM_PROMPT.md'));
        // Also verify at least one council-like directory or seats file exists
        const entries = await fs.readdir(MASTERMIND_ROOT);
        const hasCouncilContent = entries.some((e) =>
            e === 'seats' || e === 'COGNITIVE_DOSSIERS.md' || e === 'SIGNATURE_QUESTIONS.md',
        );
        return hasCouncilContent;
    } catch {
        return false;
    }
}

// ── Shared Classification ────────────────────────────────────────

/** Map decision types to council categories (normalized to lowercase). */
export const ROUTING_TABLE: Record<string, string[]> = {
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

/** Classification rules: [type, keywords]. */
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

/** Governance-specific severity keywords. */
export const SEVERITY_KEYWORDS: Record<string, string[]> = {
    critical: ['irreversible', 'delete', 'payment', 'security', 'breach', 'fire', 'legal'],
    standard: ['strategy', 'architecture', 'roadmap', 'partnership', 'pricing'],
    routine: ['bug', 'style', 'refactor', 'docs', 'config'],
};

/** Governance-specific council names (title-case for display). */
export const COUNCIL_ROUTING: Record<string, { councils: string[]; reason: string }> = {
    technology: { councils: ['Technology'], reason: 'Technical decision' },
    strategy: { councils: ['Keystone', 'Business'], reason: 'Strategic decision' },
    marketing: { councils: ['Marketing', 'E-commerce'], reason: 'Marketing & growth' },
    product: { councils: ['Business', 'E-commerce'], reason: 'Product decision' },
    crisis: { councils: ['Keystone', 'Business', 'Technology'], reason: 'Crisis response' },
    ethics: { councils: ['Keystone', 'Singularity'], reason: 'Ethics & values' },
    operations: { councils: ['Business', 'E-commerce'], reason: 'Operations & workflow' },
    singularity: { councils: ['Singularity', 'Keystone'], reason: 'Singularity & consciousness' },
    general: { councils: ['Keystone', 'Business'], reason: 'General decision' },
};

/**
 * Score-based task classification — matches ALL rules and returns the highest-scoring type.
 * Single source of truth used by both analyze and governance tools.
 */
export function classifyTask(task: string): { type: string; keywords: string[] } {
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

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0]?.[0] || 'general';
    return { type: primary, keywords: allMatched };
}

/**
 * Classify task severity for governance checks.
 */
export function classifySeverity(task: string): string {
    const lower = task.toLowerCase();
    for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) return severity;
    }
    return 'routine';
}

// ── Shared Search Utilities ──────────────────────────────────────

/**
 * Extract search keywords from a query string.
 * Returns a warning flag when all keywords are filtered out due to length.
 */
export function extractKeywords(query: string): { keywords: string[]; allFiltered: boolean } {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const keywords = words.filter((w) => w.length > 2);
    return {
        keywords,
        allFiltered: words.length > 0 && keywords.length === 0,
    };
}

/**
 * Parse wisdom entries from the Wisdom Codex — consistent format matching.
 * Matches entries starting with `- [`, `- *`, `> `, or any `- ` bullet > 10 chars.
 */
export function parseWisdomEntries(wisdom: string): string[] {
    return wisdom.split('\n').filter((l) =>
        l.startsWith('- [') || l.startsWith('- *') || l.startsWith('> ') || (l.startsWith('- ') && l.length > 10),
    );
}

// ── Trust Oracle I/O ─────────────────────────────────────────────

export interface TrustProfile {
    reliability: number;
    honesty: number;
    followThrough: number;
    outcomeQuality: number;
    stability: number;
    riskProfile: number;
    interactions: number;
    lastUpdated: string;
}

export interface TrustOracle {
    agents: Record<string, TrustProfile>;
}

/**
 * Update (or create) a trust profile for an entity based on an outcome report.
 * Uses exponential moving average with α = 0.2 for smooth score evolution.
 */
export async function updateTrustOracle(
    entity: string | undefined,
    success: boolean,
): Promise<{ updated: boolean; error?: string }> {
    if (!entity) return { updated: false, error: 'No entity provided' };

    try {
        const content = await safeReadFile(TRUST_ORACLE_PATH);
        const oracle: TrustOracle = content
            ? (safeParseJSON<TrustOracle>(content) || { agents: {} })
            : { agents: {} };

        const existing = oracle.agents[entity];
        const alpha = 0.2; // EMA smoothing factor
        const delta = success ? 0.1 : -0.15; // Asymmetric — failures weigh more

        if (existing) {
            // EMA update on relevant dimensions
            existing.reliability = Math.max(0, Math.min(1, existing.reliability + alpha * delta));
            existing.outcomeQuality = Math.max(0, Math.min(1, existing.outcomeQuality + alpha * delta));
            existing.followThrough = Math.max(0, Math.min(1, existing.followThrough + alpha * (success ? 0.05 : -0.1)));
            existing.interactions += 1;
            existing.lastUpdated = now();
        } else {
            // Bootstrap new profile at neutral 0.5
            oracle.agents[entity] = {
                reliability: 0.5 + delta,
                honesty: 0.5,
                followThrough: 0.5 + (success ? 0.05 : -0.1),
                outcomeQuality: 0.5 + delta,
                stability: 0.5,
                riskProfile: 0.5,
                interactions: 1,
                lastUpdated: now(),
            };
        }

        // Ensure directory exists and write
        await fs.mkdir(path.dirname(TRUST_ORACLE_PATH), { recursive: true });
        await fs.writeFile(TRUST_ORACLE_PATH, JSON.stringify(oracle, null, 2), 'utf-8');
        return { updated: true };
    } catch (err) {
        return { updated: false, error: err instanceof Error ? err.message : String(err) };
    }
}
