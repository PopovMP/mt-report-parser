import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {readFileSync}  from "node:fs";

import {describe, it} from "node:test";
import {equal}        from "node:assert";

import {parse} from "@popovmp/html-ast";
import * as parser from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const html = readFileSync(join(__dirname, "res/ReportHistory-70358000.html"), "ascii");
const ast = parse(html);

describe("Parse stats", () => {
    it("Show filtered stats", () => {
        const positions = parser.parsePositions(ast);
        const stats = parser.filterStatistics(positions);
        console.log(JSON.stringify(stats, null, 4));
    });
});
