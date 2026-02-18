/**
 * Shared utilities for the Boardroom MCP Server.
 *
 * Handles file I/O, path resolution, classification, search,
 * and trust oracle operations. All tools import from here to
 * guarantee behavioral consistency.
 *
 * @module utils
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
    McpToolResponse,
    Classification,
    ClassificationRule,
    CouncilRoute,
    KeywordResult,
    TrustProfile,
    TrustOracle,
    TrustUpdateResult,
} from './types.js';

// Re-export types so tools can import everything from utils
export type { TrustProfile, TrustOracle, TrustUpdateResult };

// ── Path Configuration ───────────────────────────────────────────
// All paths are configurable via environment variables for portability.

const HOME = process.env.HOME || process.env.USERPROFILE || '/home/user';

/** Root directory for protocol files. Override: `BOARDROOM_ROOT` env var. */
export const BOARDROOM_ROOT = process.env.BOARDROOM_ROOT
    || path.join(HOME, '.ai/boardroom');

/** Mastermind subdirectory containing councils, seats, and system prompts. */
export const MASTERMIND_ROOT = path.join(BOARDROOM_ROOT, 'mastermind');

/** Path to the LEDGER — persistent decision memory (Markdown). */
export const LEDGER_PATH = path.join(BOARDROOM_ROOT, 'LEDGER.md');

/** Path to the Wisdom Codex — distilled principles (Markdown). */
export const WISDOM_PATH = path.join(MASTERMIND_ROOT, 'BOARD_WISDOM.md');

/** Path to structured LEDGER index (JSON). Reserved for future indexing. */
export const LEDGER_JSON_PATH = path.join(MASTERMIND_ROOT, 'boardroom_ledger.json');

/** Path to Trust Oracle data file. Override: `BOARDROOM_TRUST_PATH` env var. */
export const TRUST_ORACLE_PATH = process.env.BOARDROOM_TRUST_PATH
    || path.join(HOME, '.boardroom/trust-oracle.json');

// Demo council path — ships with the package
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to bundled demo council (3 advisors). Resolves relative to dist/. */
export const DEMO_ROOT = path.join(__dirname, '../demo');

// ── File I/O ─────────────────────────────────────────────────────

/**
 * Safely read a file, returning empty string on failure.
 *
 * @param filePath - Absolute path to the file.
 * @returns File contents or empty string if the file doesn't exist.
 */
export async function safeReadFile(filePath: string): Promise<string> {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch {
        return '';
    }
}

/**
 * Safely parse a JSON string, returning null on failure.
 *
 * @param content - Raw JSON string.
 * @returns Parsed object or null if the JSON is invalid.
 */
export function safeParseJSON<T>(content: string): T | null {
    try {
        return JSON.parse(content) as T;
    } catch {
        return null;
    }
}

// ── MCP Response Helpers ─────────────────────────────────────────

/**
 * Format a successful MCP tool response.
 *
 * @param text - Markdown-formatted response body.
 */
export function mcpSuccess(text: string): McpToolResponse {
    return { content: [{ type: 'text' as const, text }] };
}

/**
 * Format an MCP tool error response.
 *
 * @param text - Error description (will be prefixed with ❌).
 */
export function mcpError(text: string): McpToolResponse {
    return { content: [{ type: 'text' as const, text: `❌ ${text}` }], isError: true as const };
}

/**
 * Get the current UTC timestamp in ISO 8601 format.
 */
export function now(): string {
    return new Date().toISOString();
}

// ── Input Validation ─────────────────────────────────────────────

/** Maximum allowed length for user-provided input strings. */
const MAX_INPUT_LENGTH = 10_000;

/**
 * Validate and sanitize user input.
 *
 * Enforces a maximum length to prevent memory/compute abuse and strips
 * null bytes to prevent path traversal attacks.
 *
 * @param input - Raw user input string.
 * @param fieldName - Name of the field (for error messages).
 * @returns Sanitized string.
 * @throws Error if the input exceeds the maximum length.
 */
export function validateInput(input: string, fieldName: string = 'input'): string {
    if (input.length > MAX_INPUT_LENGTH) {
        throw new Error(
            `${fieldName} exceeds maximum length (${MAX_INPUT_LENGTH} characters). ` +
            `Received ${input.length} characters.`,
        );
    }
    // Strip null bytes — prevents path traversal via embedded \0
    return input.replace(/\0/g, '');
}

// ── Protocol File Detection ──────────────────────────────────────

/**
 * Check if the full protocol files are installed.
 *
 * Requires SYSTEM_PROMPT.md AND at least one council-level file
 * to avoid false positives from partial installs.
 *
 * @returns `true` if the user has installed the full protocol files.
 */
export async function hasProtocolFiles(): Promise<boolean> {
    try {
        await fs.access(path.join(MASTERMIND_ROOT, 'SYSTEM_PROMPT.md'));
        const entries = await fs.readdir(MASTERMIND_ROOT);
        return entries.some((e) =>
            e === 'seats' || e === 'COGNITIVE_DOSSIERS.md' || e === 'SIGNATURE_QUESTIONS.md',
        );
    } catch {
        return false;
    }
}

// ── Task Classification ──────────────────────────────────────────

/** Map decision types to lowercase council identifiers for seat loading. */
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

/** Classification rules — ordered by specificity (most niche first). */
const CLASSIFICATION_RULES: ClassificationRule[] = [
    ['singularity', ['omega', 'singularity', 'agi', 'superintelligence', 'consciousness']],
    ['technology', ['code', 'debug', 'algorithm', 'deploy', 'server', 'api', 'database', 'mcp', 'architecture', 'refactor', 'test', 'ci']],
    ['marketing', ['marketing', 'seo', 'content strategy', 'social media', 'brand', 'audience', 'ads', 'growth', 'campaign', 'funnel']],
    ['product', ['product', 'feature', 'ux', 'design', 'pricing', 'tier', 'launch', 'onboarding', 'user experience']],
    ['crisis', ['crisis', 'emergency', 'breach', 'outage', 'critical', 'urgent', 'incident']],
    ['strategy', ['strategy', 'revenue', 'monetize', 'compete', 'pivot', 'invest', 'roadmap', 'moat', 'acquisition']],
    ['operations', ['process', 'workflow', 'automate', 'optimize', 'pipeline', 'cron', 'devops']],
    ['ethics', ['ethics', 'values', 'moral', 'trust', 'privacy', 'fairness']],
];

/** Severity keywords — checked in priority order (critical first). */
export const SEVERITY_KEYWORDS: Record<string, string[]> = {
    critical: ['irreversible', 'delete', 'payment', 'security', 'breach', 'fire', 'legal'],
    standard: ['strategy', 'architecture', 'roadmap', 'partnership', 'pricing'],
    routine: ['bug', 'style', 'refactor', 'docs', 'config'],
};

/** Title-case council names and routing rationale for governance display. */
export const COUNCIL_ROUTING: Record<string, CouncilRoute> = {
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
 * Score-based task classification.
 *
 * Evaluates ALL rules and returns the highest-scoring category.
 * Single source of truth — used by both `analyze` and `check_governance`.
 *
 * @param task - The user's decision, question, or task description.
 * @returns The best-matching category and all matched keywords.
 */
export function classifyTask(task: string): Classification {
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
 * Classify task severity for governance routing.
 *
 * @param task - The user's task description.
 * @returns Severity level: "critical", "standard", or "routine".
 */
export function classifySeverity(task: string): string {
    const lower = task.toLowerCase();
    for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) return severity;
    }
    return 'routine';
}

// ── Search Utilities ─────────────────────────────────────────────

/** Minimum keyword length to include in search (inclusive). */
const MIN_KEYWORD_LENGTH = 3;

/**
 * Extract search keywords from a query string.
 *
 * Filters out words shorter than {@link MIN_KEYWORD_LENGTH} characters.
 * Returns a warning flag when ALL words are filtered out.
 *
 * @param query - Raw search query.
 * @returns Extracted keywords and whether filtering removed everything.
 */
export function extractKeywords(query: string): KeywordResult {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const keywords = words.filter((w) => w.length >= MIN_KEYWORD_LENGTH);
    return {
        keywords,
        allFiltered: words.length > 0 && keywords.length === 0,
    };
}

/**
 * Parse wisdom entries from the Wisdom Codex.
 *
 * Matches entries starting with `- [`, `- *`, `> `, or any `- ` bullet
 * longer than 10 characters.
 *
 * @param wisdom - Raw Wisdom Codex content.
 * @returns Array of individual wisdom entries.
 */
export function parseWisdomEntries(wisdom: string): string[] {
    if (!wisdom) return [];
    return wisdom.split('\n').filter((l) =>
        l.startsWith('- [') || l.startsWith('- *') || l.startsWith('> ') || (l.startsWith('- ') && l.length > 10),
    );
}

// ── Trust Oracle ─────────────────────────────────────────────────

/** EMA smoothing factor for trust score updates. */
const TRUST_EMA_ALPHA = 0.2;

/** Score delta for successful outcomes. */
const TRUST_DELTA_SUCCESS = 0.1;

/** Score delta for failed outcomes (negative, asymmetric — failures weigh more). */
const TRUST_DELTA_FAILURE = -0.15;

/** Clamp a value to the [0, 1] range. */
function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

/**
 * Update (or create) a trust profile for an entity based on an outcome report.
 *
 * Uses exponential moving average (α = {@link TRUST_EMA_ALPHA}) for smooth
 * score evolution. Deltas are asymmetric — failures erode trust faster
 * than successes build it.
 *
 * @param entity - The entity name (agent, tool, vendor, platform).
 * @param success - Whether the outcome was positive.
 * @returns Whether the update succeeded and any error message.
 */
export async function updateTrustOracle(
    entity: string | undefined,
    success: boolean,
): Promise<TrustUpdateResult> {
    if (!entity) return { updated: false, error: 'No entity provided' };

    try {
        const content = await safeReadFile(TRUST_ORACLE_PATH);
        const oracle: TrustOracle = content
            ? (safeParseJSON<TrustOracle>(content) || { agents: {} })
            : { agents: {} };

        const existing = oracle.agents[entity];
        const delta = success ? TRUST_DELTA_SUCCESS : TRUST_DELTA_FAILURE;

        if (existing) {
            existing.reliability = clamp01(existing.reliability + TRUST_EMA_ALPHA * delta);
            existing.outcomeQuality = clamp01(existing.outcomeQuality + TRUST_EMA_ALPHA * delta);
            existing.followThrough = clamp01(existing.followThrough + TRUST_EMA_ALPHA * (success ? 0.05 : -0.1));
            existing.interactions += 1;
            existing.lastUpdated = now();
        } else {
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

        await fs.mkdir(path.dirname(TRUST_ORACLE_PATH), { recursive: true });
        await fs.writeFile(TRUST_ORACLE_PATH, JSON.stringify(oracle, null, 2), 'utf-8');
        return { updated: true };
    } catch (err) {
        return { updated: false, error: err instanceof Error ? err.message : String(err) };
    }
}
