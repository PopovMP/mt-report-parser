import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("void tag", () => {
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
