import {parse, getElementsByTagName} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("query class", () => {
    const html = '<div><div><input><div><input></div></div></div>';
    const ast = parse(html);
    const element = ast.children[0];

    it("classname", () => {
        const elements = getElementsByTagName(element, "input");
        equal(elements.length, 2);
    });
});
