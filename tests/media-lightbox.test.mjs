import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../components/MediaLightbox.tsx", import.meta.url);

test("MediaLightbox preserves the complete image and exposes an accessible modal", async () => {
  const source = await readFile(sourceUrl, "utf8");

  assert.match(source, /^"use client";/);
  assert.match(source, /<dialog[\s\S]*aria-modal="true"/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(source, /onCancel=[\s\S]*preventDefault\(\)[\s\S]*close\(\)/);
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /handleBackdropClick/);
  assert.match(source, /querySelectorAll<HTMLElement>/);
  assert.match(source, /trapDialogFocus/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(source, /focusTarget\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /height: "auto"/);
  assert.match(source, /objectFit: "contain"/);
  assert.doesNotMatch(source, /objectFit: "cover"/);
});

test("MediaLightbox provides paired English and Traditional Chinese controls", async () => {
  const source = await readFile(sourceUrl, "utf8");

  assert.match(source, /Open full-size image/);
  assert.match(source, /查看原尺寸圖片/);
  assert.match(source, /Close full-size image/);
  assert.match(source, /關閉原尺寸圖片/);
});
