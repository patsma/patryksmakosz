import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { actions, runAction } from "../lib/actions/index.js";

const dir = fileURLToPath(new URL("../lib/actions/", import.meta.url));

test("every action file is registered, helpers and the index are not", () => {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("_") && f !== "index.js")
    .map((f) => f.slice(0, -3))
    .sort();
  assert.deepEqual(Object.keys(actions).sort(), files);
  assert.ok(!("_pointer" in actions));
});

test("the documented actions all exist", () => {
  for (const name of ["goto", "pause", "waitFor", "scroll", "move", "hover", "click", "screenshot"]) {
    assert.ok(actions[name], `missing ${name}`);
  }
});

test("every action exports run(), and validate() when it has one is a function", () => {
  for (const [name, mod] of Object.entries(actions)) {
    assert.equal(typeof mod.run, "function", `${name}.run`);
    if (mod.validate) assert.equal(typeof mod.validate, "function", `${name}.validate`);
  }
});

test("runAction names the action index, name and argument when it fails", async () => {
  const ctx = { page: { waitForSelector: async () => { throw new Error("Timeout 15000ms\nCall log: ..."); } } };
  await assert.rejects(runAction(ctx, { waitFor: ".nav a" }, 1), {
    message: 'action 2 waitFor ".nav a": not visible within 15s',
  });
});

test("runAction keeps only the first line of a long Playwright error", async () => {
  const ctx = { page: { goto: async () => { throw new Error("net::ERR_NAME_NOT_RESOLVED\nCall log: ..."); } }, baseUrl: "https://x.test/" };
  await assert.rejects(runAction(ctx, { goto: "/about/" }, 0), {
    message: 'action 1 goto "/about/": net::ERR_NAME_NOT_RESOLVED',
  });
});
