/**
 * Test isolation — point every boardroom data path at a throwaway
 * directory so test runs never touch the developer's real
 * `~/.ai/boardroom/` or `~/.boardroom/` files.
 *
 * The src modules resolve their paths from environment variables at
 * import time, and ESM evaluates static imports in declaration order,
 * so every test file must import this module FIRST.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'boardroom-test-'));

process.env.BOARDROOM_ROOT = path.join(isolatedRoot, 'data');
process.env.BOARDROOM_TRUST_PATH = path.join(isolatedRoot, 'trust-oracle.json');
