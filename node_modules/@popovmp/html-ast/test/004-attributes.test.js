import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("attributes", () => {
    it("Parse one attribute", () => {
        const html = '<html lang="English"></html>';
        const ast = parse(html);
        const attributes = ast.children[0].attributes;
        equal(attributes["lang"], "English");
    });

    it("Parse two attributes", () => {
        const html = '<html lang="English" class="wrapper main-page"></html>';
        const ast = parse(html);
        const attributes = ast.children[0].attributes;
        equal(attributes["class"], "wrapper main-page");
    });

    it("attribute without quotation marks", () => {
        const html = '<td colspan=2></td>';
        const ast = parse(html);
        const attributes = ast.children[0].attributes;
        equal(attributes["colspan"], 2);
    });

    it("attribute without value", () => {
        const html = '<td nowrap></td>';
        const ast = parse(html);
        const attributes = ast.children[0].attributes;
        equal(attributes["nowrap"], "");
    });
});
