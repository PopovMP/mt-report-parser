import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {readFileSync}  from "node:fs";

import {describe, it} from "node:test";
import {equal}        from "node:assert";

import {parse} from "@popovmp/html-ast";
import {parsePositions} from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const html = readFileSync(join(__dirname, "res/ReportHistory-70358000.html"), "ascii");
const ast = parse(html);

describe("Parse report history", () => {
    it("Parse Positions", () => {
        const positions = parsePositions(ast);

        equal(positions.length, 658)
        equal(positions[0].posId, 1771882106);
        equal(positions[0].magic, 200011);
        equal(positions[positions.length-1].posId, 1775381191);
        equal(positions[positions.length-1].magic, 100005);
    });
});
