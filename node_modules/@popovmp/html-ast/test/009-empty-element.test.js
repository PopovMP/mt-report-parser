import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("empty element", () => {
    it("Parse an empty element", () => {
        const html = `<td></td>`;
        const ast  = parse(html);
        const td   = ast.children[0];
        equal(td.tagName, "td");
        equal(td.children.length, 0);
    });
});
