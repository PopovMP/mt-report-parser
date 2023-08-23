import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("void tag", () => {
    it("parse <br>", () => {
        const html = "<body><br><div></div><br></body>";
        const ast = parse(html);

        const br1 = ast.children[0].children[0];
        equal(br1.tagName, "br");
        equal(br1.children.length, 0);

        const div = ast.children[0].children[1];
        equal(div.tagName, "div");
        equal(div.children.length, 0);

        const br2 = ast.children[0].children[2];
        equal(br2.tagName, "br");
        equal(br2.children.length, 0);
    });

    it('Parse a void tag', () => {
        const html = `<!DOCTYPE html>
                        <html lang="en">
                          <head>
                            <meta name="generator" content="client terminal">
                            <title></title>
                          </head>
                        </html>
        `;
        const ast = parse(html);
        const meta = ast.children[0].children[0].children[0];
        equal(meta.tagName, "meta");
    });
});
