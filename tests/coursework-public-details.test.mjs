import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const records = JSON.parse(
  readFileSync(join(projectRoot, "lib", "coursework-public-details.json"), "utf8"),
);

test("all 15 coursework records have complete bilingual canonical detail", () => {
  assert.equal(records.length, 15);
  assert.equal(new Set(records.map((record) => record.courseworkId)).size, 15);
  assert.equal(new Set(records.map((record) => record.route)).size, 15);

  for (const record of records) {
    assert.equal(record.sourceStatus, "canonical_markdown");
    assert.match(record.courseworkId, /^coursework-\d{3}$/);
    assert.match(record.route, /^\/academics\//);
    assert.ok(record.blocks.en.length > 0, `${record.courseworkId} needs English detail`);
    assert.ok(record.blocks.zh.length > 0, `${record.courseworkId} needs Chinese detail`);
    assert.ok(record.blocks.en.some((block) => block.type === "paragraph"));
    assert.ok(record.blocks.zh.some((block) => block.type === "paragraph"));
  }
});

test("coursework public detail excludes source paths and internal governance", () => {
  const text = JSON.stringify(records);
  for (const forbidden of [
    /[A-Za-z]:\\\\/,
    /(?:^|[\\/])Users[\\/]/i,
    /(?:參考資料|學術申請用網站)[\\/]/,
    /canonical_source/i,
    /local_only/i,
    /Internal Editorial Notes/i,
    /內部建站註記/,
    /Do Not Publish/i,
    /禁止直接公開/,
    /素材治理/,
    /隱私備註/,
  ]) {
    assert.doesNotMatch(text, forbidden);
  }
});
