import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("complex head element", () => {
    it('Parse "head" element', () => {
        const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
                        <html>
                          <head>
                            <title>70358000: MetaTrader 5 Desktop Demo - Trade Account Report</title>
                            <meta name="generator" content="client terminal">
                            <style type="text/css">
                            <!--
                            body {margin:1px;}
                            //-->
                            </style>
                          </head>
                          <body>
                          </body>
                        </html>
        `;
        const ast = parse(html);
        equal(ast.children[0].children[0].tagName, "head");
    });
});
