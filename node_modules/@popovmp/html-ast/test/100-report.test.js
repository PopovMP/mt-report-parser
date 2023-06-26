import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {readFileSync}  from "node:fs";

import {describe, it} from "node:test";
import {equal}        from "node:assert";

import {parse} from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const html = readFileSync(join(__dirname, "res/test.html"), "ascii");

describe("parse complex html file", () => {
    it("Parse HTML string to AST", () => {
        const ast = parse(html);
        equal(ast.children[0].children[0].tagName, "head");
        equal(ast.children[0].children[1].tagName, "body");
    });
});
