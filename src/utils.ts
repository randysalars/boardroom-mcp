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
