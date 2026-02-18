/**
 * Type definitions for the Boardroom MCP Server.
 *
 * Centralizes all shared types to keep tool modules focused on logic.
 *
 * @module types
 */

// ── MCP Response Types ───────────────────────────────────────────

/** Standard MCP tool response shape — matches the SDK's `CallToolResult` interface. */
export interface McpToolResponse {
    [x: string]: unknown;
    content: Array<{ type: 'text'; text: string }>;
    isError?: true;
}

// ── Classification Types ─────────────────────────────────────────

/** Result of score-based task classification. */
export interface Classification {
    /** The decision category (e.g., "technology", "strategy", "crisis"). */
    type: string;
    /** Keywords from the input that matched classification rules. */
    keywords: string[];
}

/** A single classification rule mapping a category to trigger keywords. */
export type ClassificationRule = [category: string, keywords: string[]];

/** Council routing entry for governance display. */
export interface CouncilRoute {
    /** Council names in title-case for display. */
    councils: string[];
    /** Human-readable reason for this routing. */
    reason: string;
}

// ── Search Types ─────────────────────────────────────────────────

/** Keyword extraction result with quality signal. */
export interface KeywordResult {
    /** Extracted keywords that passed the minimum length filter. */
    keywords: string[];
    /** True if the query had words but all were too short to be useful. */
    allFiltered: boolean;
}

// ── Trust Oracle Types ───────────────────────────────────────────

/**
 * A 6-dimension trust vector for an entity.
 *
 * All dimension scores are normalized to [0, 1].
 */
export interface TrustProfile {
    reliability: number;
    honesty: number;
    followThrough: number;
    outcomeQuality: number;
    stability: number;
    riskProfile: number;
    /** Total number of recorded interactions with this entity. */
    interactions: number;
    /** ISO 8601 timestamp of the last profile update. */
    lastUpdated: string;
}

/** Root structure of the Trust Oracle data file. */
export interface TrustOracle {
    agents: Record<string, TrustProfile>;
}

/** Result of a trust oracle update operation. */
export interface TrustUpdateResult {
    updated: boolean;
    error?: string;
}

// ── Advisor Types ────────────────────────────────────────────────

/** Parsed details from an advisor's seat card. */
export interface AdvisorDetails {
    philosophy: string;
    criteria: string;
    signatureQuestion: string;
    tensionArea: string;
}

/** Result of loading council seat data. */
export interface CouncilSeatResult {
    advisors: string[];
    content: string;
    source: string;
}

// ── Trust Scoring Constants ──────────────────────────────────────

/** Weights for computing the composite trust score (must sum to 1.0). */
export const TRUST_WEIGHTS = {
    reliability: 0.25,
    honesty: 0.20,
    followThrough: 0.20,
    outcomeQuality: 0.15,
    stability: 0.10,
    riskProfile: 0.10,
} as const;

/** Compute the weighted composite trust score from a profile. */
export function computeCompositeScore(profile: TrustProfile): number {
    return (
        profile.reliability * TRUST_WEIGHTS.reliability +
        profile.honesty * TRUST_WEIGHTS.honesty +
        profile.followThrough * TRUST_WEIGHTS.followThrough +
        profile.outcomeQuality * TRUST_WEIGHTS.outcomeQuality +
        profile.stability * TRUST_WEIGHTS.stability +
        profile.riskProfile * TRUST_WEIGHTS.riskProfile
    );
}
