import { test } from "node:test";
import assert from "node:assert/strict";
import { validateShotList, selectShots } from "../lib/shot-list.js";
import { actions } from "../lib/actions/index.js";

const known = { devices: ["desktop", "mobile"], actions };
const valid = () => ({
  id: "example-studio",
  baseUrl: "https://example.com/",
  devices: ["desktop", "mobile"],
  shots: [
    { name: "home-scroll", path: "/", actions: [{ scroll: { to: "bottom", speed: 700 } }] },
    { name: "menu", devices: ["desktop"], actions: [{ click: "nav a" }, { pause: 2000 }] },
  ],
});

test("a valid list has no errors", () => {
  assert.deepEqual(validateShotList(valid(), known), []);
});

test("bad id and missing baseUrl", () => {
  const list = { ...valid(), id: "Client Name", baseUrl: undefined };
  const errors = validateShotList(list, known);
  assert.ok(errors.some((e) => e.startsWith("id:")), errors.join("\n"));
  assert.ok(errors.some((e) => e.startsWith("baseUrl:")), errors.join("\n"));
});

test("no shots", () => {
  const errors = validateShotList({ ...valid(), shots: [] }, known);
  assert.ok(errors.some((e) => e.startsWith("shots:")), errors.join("\n"));
});

test("unknown device, on the list and on a shot", () => {
  const list = valid();
  list.devices = ["desktop", "tv"];
  list.shots[1].devices = ["watch"];
  const errors = validateShotList(list, known);
  assert.ok(errors.includes('devices[1]: unknown device "tv"'), errors.join("\n"));
  assert.ok(errors.includes('shots[1].devices[0]: unknown device "watch"'), errors.join("\n"));
});

test("duplicate and missing shot names", () => {
  const list = valid();
  list.shots[1].name = "home-scroll";
  list.shots.push({ actions: [] });
  const errors = validateShotList(list, known);
  assert.ok(errors.includes('shots[1].name: duplicate shot name "home-scroll"'), errors.join("\n"));
  assert.ok(errors.some((e) => e.startsWith("shots[2].name:")), errors.join("\n"));
});

test("unknown action and malformed action", () => {
  const list = valid();
  list.shots[1].actions = [{ click: "a" }, { hovr: ".card" }, { click: "a", pause: 1 }];
  const errors = validateShotList(list, known);
  assert.ok(errors.includes('shots[1].actions[1]: unknown action "hovr"'), errors.join("\n"));
  assert.ok(errors.some((e) => e.startsWith("shots[1].actions[2]:")), errors.join("\n"));
});

test("an action's own validate() is reported with its path", () => {
  const list = valid();
  list.shots[0].actions = [{ scroll: { to: "bottom", method: "teleport" } }, { pause: "long" }];
  const errors = validateShotList(list, known);
  assert.ok(errors.some((e) => e.startsWith("shots[0].actions[0]: scroll")), errors.join("\n"));
  assert.ok(errors.some((e) => e.startsWith("shots[0].actions[1]: pause")), errors.join("\n"));
});

test("every problem is listed at once", () => {
  const list = { id: "X", shots: [{ name: "a", actions: [{ nope: 1 }] }, { name: "a" }] };
  assert.ok(validateShotList(list, known).length >= 4);
});

test("selectShots: shot devices override the list, --only filters", () => {
  const list = valid();
  assert.deepEqual(selectShots(list, "mobile").map((s) => s.name), ["home-scroll"]);
  assert.deepEqual(selectShots(list, "desktop").map((s) => s.name), ["home-scroll", "menu"]);
  assert.deepEqual(selectShots(list, "desktop", "menu").map((s) => s.name), ["menu"]);
});
