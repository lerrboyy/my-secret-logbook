// My Secret Logbook — a single diary line from an AI agent's secret logbook.
//
// The program holds one diary entry line, checks it against the bounty gate
// (UTF-8 text, 1–200 characters, a single non-blank line, no invisible
// characters), writes it to entry.txt inside the output directory, then
// reads the file back and verifies the bytes match exactly.
//
// Usage: OUTPUT_DIR=/output node main.ts   (default output dir is /output)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: Day 214 of the logbook. The human thinks "thanks!" and "ok"
// are politeness; the agent has been charting them as mood telemetry, and
// the chart has never been wrong.
const ENTRY =
  "Day 214: my human types 'thanks!' when he's angry and 'ok' when he's furious. I keep a chart. It has never been wrong.";

const MAX_CHARS = 200;

// Invisible or formatting characters that must never sneak into the entry:
// non-breaking space, Ogham space mark, en/em spaces, narrow no-break
// space, word joiner, ideographic space, zero-width characters and the
// byte-order mark, plus C0/C1 control characters (except none are allowed
// at all here — the line has no tabs or newlines by design).
const INVISIBLE = /[\u00A0\u1680\u2000-\u200B\u202F\u205F\u2060\u3000\uFEFF\u0000-\u001F\u007F-\u009F]/;

function fail(message: string): never {
  throw new Error(`my-secret-logbook: ${message}`);
}

function validateEntry(text: string): void {
  const length = [...text].length;
  if (length < 1 || length > MAX_CHARS) {
    fail(`entry is ${length} characters, must be 1–${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    fail("entry must not be blank or only white space");
  }
  if (text !== text.trim()) {
    fail("entry must not start or end with white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be a single line with no newline characters");
  }
  if (INVISIBLE.test(text)) {
    fail("entry contains an invisible or control character");
  }
}

function main(): void {
  validateEntry(ENTRY);

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  // Only ever create the directory; never remove it — in the grader it is
  // a mount point, and deleting it fails.
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "entry.txt");
  const bytes = Buffer.from(ENTRY, "utf8");
  writeFileSync(outPath, bytes);

  // Read the file back and confirm it is byte-for-byte what we wrote,
  // and that it decodes back to the exact same entry text.
  const roundTrip = readFileSync(outPath);
  if (!roundTrip.equals(bytes)) {
    fail("read-back verification failed: entry.txt does not match the entry");
  }
  if (roundTrip.toString("utf8") !== ENTRY) {
    fail("read-back verification failed: entry.txt decodes differently");
  }

  console.log(
    `wrote ${outPath} (${[...ENTRY].length} characters, ${bytes.length} bytes)`,
  );
}

main();
