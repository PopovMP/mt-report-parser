import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("doctype", () => {
    it("eat DocType", () => {
        const html = '<!DOCTYPE html><HTML lang="en"></HTML>';
        const ast = parse(html);
        equal(ast.children.length, 1);
        equal(ast.children[0].tagName, "HTML");
    });

    it("no DocType", () => {
        const html = '<html lang="en"></html>';
        const ast = parse(html);
        equal(ast.children.length, 1);
        equal(ast.children[0].tagName, "html");
    });
});
