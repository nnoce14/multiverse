#!/usr/bin/env node
// Formal multiverse binary entry point.
// Invokes the compiled CLI. Run `pnpm --filter @multiverse/cli build` first.
import { main } from '../dist/index.js';
await main();
