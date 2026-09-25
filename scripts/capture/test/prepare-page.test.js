import { test } from "node:test";
import assert from "node:assert/strict";
import { checkResponse } from "../lib/prepare-page.js";

const res = (status) => ({ status: () => status });

test("a 2xx/3xx page is fine, and file:// has no response at all", () => {
  assert.doesNotThrow(() => checkResponse(res(200), "https://x.test/"));
  assert.doesNotThrow(() => checkResponse(res(304), "https://x.test/"));
  assert.doesNotThrow(() => checkResponse(null, "file:///fixture/index.html"));
});

test("an error page fails the shot instead of being recorded", () => {
  assert.throws(() => checkResponse(res(404), "https://x.test/a"), /HTTP 404 from https:\/\/x.test\/a/);
});

test("429 says the host is rate-limiting", () => {
  assert.throws(() => checkResponse(res(429), "https://x.test/"), /rate-limit/);
});
