import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const courseRecord = JSON.parse(
  readFileSync(join(projectRoot, "lib", "course-record.json"), "utf8"),
);
const coursework = JSON.parse(
  readFileSync(join(projectRoot, "lib", "coursework-public-details.json"), "utf8"),
);

const semesterRecords = courseRecord.semesters.flatMap((semester) =>
  semester.courses.map((course) => ({ ...course, semesterId: semester.id })),
);
const exemptionRecords = courseRecord.exemptions.map((course) => ({
  ...course,
  semesterId: "exemptions",
}));
const allStatusRecords = [...semesterRecords, ...exemptionRecords];

const countByStatus = (status) =>
  allStatusRecords.filter((record) => record.status === status).length;
const creditsByStatus = (status) =>
  allStatusRecords
    .filter((record) => record.status === status)
    .reduce((total, record) => total + record.credits, 0);

test("the public course record preserves all 78 canonical status records", () => {
  assert.equal(courseRecord.semesters.length, 8);
  assert.equal(semesterRecords.length, 76);
  assert.equal(exemptionRecords.length, 2);
  assert.equal(allStatusRecords.length, 78);

  // A semester plus course code is the stable identity of an enrollment record.
  // It keeps repeated courses and the two-term thesis sequence distinct.
  const recordKeys = allStatusRecords.map(
    (record) => `${record.semesterId}:${record.code}`,
  );
  assert.equal(new Set(recordKeys).size, 78);

  for (const record of allStatusRecords) {
    assert.match(record.code, /\S/);
    assert.match(record.title.en, /\S/);
    assert.match(record.title.zh, /\S/);
    assert.match(record.result.en, /\S/);
    assert.match(record.result.zh, /\S/);
    assert.ok(Object.hasOwn(courseRecord.domains, record.domain));
    assert.ok(Number.isFinite(record.credits) && record.credits >= 0);
  }
});

test("course-record summary figures exactly reconcile to the individual records", () => {
  assert.deepEqual(courseRecord.counts, {
    totalStatusRecords: 78,
    enrolledRecords: 76,
    gradedRecords: 67,
    gradedCredits: 156,
    passRecords: 5,
    passCredits: 7,
    withdrawnRecords: 4,
    withdrawnCredits: 12,
    exemptRecords: 2,
    earnedCredits: 163,
    aPlusRecords: 46,
    aPlusCredits: 110,
  });

  assert.equal(countByStatus("graded"), 67);
  assert.equal(creditsByStatus("graded"), 156);
  assert.equal(countByStatus("pass"), 5);
  assert.equal(creditsByStatus("pass"), 7);
  assert.equal(countByStatus("withdrawn"), 4);
  assert.equal(creditsByStatus("withdrawn"), 12);
  assert.equal(countByStatus("exempt"), 2);
  assert.equal(creditsByStatus("exempt"), 0);
  assert.equal(creditsByStatus("graded") + creditsByStatus("pass"), 163);
  assert.equal(
    creditsByStatus("graded")
      + creditsByStatus("pass")
      + creditsByStatus("withdrawn"),
    175,
  );

  const graded = allStatusRecords.filter((record) => record.status === "graded");
  const gradeDistribution = Object.fromEntries(
    ["A+", "A", "A-", "B+", "B"].map((grade) => {
      const records = graded.filter((record) => record.result.zh === grade);
      return [grade, {
        records: records.length,
        credits: records.reduce((total, record) => total + record.credits, 0),
      }];
    }),
  );
  assert.deepEqual(gradeDistribution, {
    "A+": { records: 46, credits: 110 },
    A: { records: 13, credits: 28 },
    "A-": { records: 2, credits: 4 },
    "B+": { records: 3, credits: 8 },
    B: { records: 3, credits: 6 },
  });
});

test("all 15 coursework detail routes are linked from the complete record", () => {
  assert.equal(coursework.length, 15);
  const courseworkRoutes = new Set(coursework.map((record) => record.route));
  assert.equal(courseworkRoutes.size, 15);

  const relatedRoutes = new Set(
    allStatusRecords.flatMap((record) =>
      record.relatedRoute ? [record.relatedRoute] : [],
    ),
  );
  for (const route of courseworkRoutes) {
    assert.equal(
      relatedRoutes.has(route),
      true,
      `Course record does not link to coursework route: ${route}`,
    );
  }
});

test("course-record data contains no local source path or private contact field", () => {
  const serialized = JSON.stringify(courseRecord);
  for (const forbidden of [
    /[A-Za-z]:\\\\/,
    /(?:^|[\\/])Users[\\/]/i,
    /file:\/\//i,
    /(?:參考資料|學術申請用網站)[\\/]/,
    /canonical_source/i,
    /local_only/i,
    /(?:password|secret|access[_ -]?token|private[_ -]?key)/i,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  ]) {
    assert.doesNotMatch(serialized, forbidden);
  }

  const keys = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      keys.push(key);
      visit(child);
    }
  };
  visit(courseRecord);
  const sensitiveField = /^(?:student(?:id|number)|school(?:email|account)|email|phone|telephone|address|governmentid|passport|password|secret|token|credential|sourcepath|canonicalsource)$/i;
  assert.deepEqual(keys.filter((key) => sensitiveField.test(key)), []);
});

test("the public PDF builder discovers local tools without personal absolute paths", () => {
  const builder = readFileSync(
    join(projectRoot, "scripts", "build_public_course_record_pdf.py"),
    "utf8",
  );
  assert.doesNotMatch(builder, /[A-Za-z]:[\\\\/]Users[\\\\/]/i);
  assert.doesNotMatch(builder, /[A-Za-z]:[\\\\/]Windows[\\\\/]/i);
  assert.match(builder, /COURSE_RECORD_FONT_DIR/);
  assert.match(builder, /shutil\.which\("pdftoppm"\)/);
  assert.match(builder, /os\.environ\.get\("SITE_URL"\)/);
  assert.match(builder, /os\.environ\.get\("NEXT_PUBLIC_SITE_URL"\)/);
});

test("the designed bilingual PDF is registered as a complete public document", () => {
  const manifest = JSON.parse(
    readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"),
  );
  const document = manifest.find((asset) => asset.id === "doc-public-course-record-2026");
  assert.ok(document);
  assert.equal(document.route, "/academics/course-record");
  assert.equal(document.kind, "document");
  assert.equal(document.pageCount, 10);
  assert.equal(document.mimeType, "application/pdf");
  assert.equal(document.download, true);
  assert.equal(document.metadataScrubbed, true);
  assert.match(document.previewPath, /Jason_Liao_Public_Course_Record_Through_Spring_2026\.webp$/);
  const registeredFiles = [
    [document.publicPath, document.sha256, document.byteSize],
    ...Object.values(document.previewVariants).map((variant) => [variant.publicPath, variant.sha256, variant.byteSize]),
  ];
  for (const [publicPath, expectedHash, expectedSize] of registeredFiles) {
    const path = join(projectRoot, "public", publicPath);
    assert.equal(existsSync(path), true);
    const bytes = readFileSync(path);
    assert.equal(bytes.length, expectedSize);
    assert.equal(createHash("sha256").update(bytes).digest("hex").toUpperCase(), expectedHash);
  }
});
