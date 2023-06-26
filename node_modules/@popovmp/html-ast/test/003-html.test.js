import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("html", () => {
    it('Parse "html" tag', () => {
        const html = "<!DOCTYPE html><html></html>";
        const ast = parse(html);
        equal(ast.children.length, 1)
        equal(ast.children[0].tagName, "html");
    });
});
