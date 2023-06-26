import {parse, getElementsByClassName} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("query class", () => {
    const html = '<div><div class="form"><input class="name first"><div><input class="name"></div></div></div>';
    const ast = parse(html);
    const element = ast.children[0];

    it("classname", () => {
        const elements = getElementsByClassName(element, "name");
        equal(elements.length, 2);
        equal(elements[0].tagName, "input");
        equal(elements[1].tagName, "input");

    });
});
