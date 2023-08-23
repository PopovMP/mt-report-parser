import {getElementsByTagName, getText} from "@popovmp/html-ast";

const LONG  = 1
const SHORT = 2

/**
 * @typedef {Object} ReportPosition
 *
 * @property {number} openTime
 * @property {number} posId
 * @property {string} symbol
 * @property {number} type
 * @property {number} magic
 * @property {number} volume
 * @property {number} openPrice
 * @property {number} closeTime
 * @property {number} closePrice
 * @property {number} profit
 */

/**
 * @typedef {Object} ReportStatistics
 *
 * @property {number} grossProfit
 * @property {number} grossLoss
 * @property {number} netProfit
 * @property {number} profitFactor
 * @property {number} countProfitable
 * @property {number} countLoosing
 * @property {number} countOfTrades
 * @property {number} countBreakeven
 * @property {number} winLossRatio
 * @property {number} maxConsecLooses
 */

/**
 * @typedef {Object} ASTElement
 *
 * @property {string}           tagName
 * @property {{string: string}} attributes
 * @property {ASTElement[]}     children
 * @property {string}           text
 */

/**
 * Parses the report positions from the HTML report AST.
 *
 * @param {ASTElement} ast
 * @returns {ReportPosition[]}
 */
export function parsePositions(ast) {
    const table = getElementsByTagName(ast, "table")[0];
    const rows  = getElementsByTagName(table, "tr");

    /** @type {ReportPosition[]} */
    const positions = [];

    let isPositionTable = false;
    let skipFirstRow    = true;
    for (const row of rows) {
        if (!isPositionTable) {
            isPositionTable = isStartOfPositionTableRow(row);
            continue;
        }
        if (skipFirstRow) {
            skipFirstRow = false;
            continue;
        }

        if (isEndOfPositionTableRow(row)) {
            break;
        }

        try {
            positions.push(parsePositionRow(row));
        }
        catch (e) {
            console.log(JSON.stringify(row, null, 4));
        }
    }

    return positions;
}

/**
 * Check if the row is the header of the "Positions" records
 * @param {ASTElement} row
 * @return {boolean}
 */
function isStartOfPositionTableRow(row) {
    if (row.attributes["align"] !== "center" ||
        row.children.length     !== 1        ||
        row.children[0].tagName !== "th") {
        return false;
    }

    const th = row.children[0];
    if (th.attributes["colspan"] !== "14" ||
        th.children.length       !== 1 ||
        th.children[0].tagName   !== "div") {
        return false;
    }

    const div = th.children[0];
    if (div.children.length     !== 1 ||
        div.children[0].tagName !== "b") {
        return false;
    }

    const b = div.children[0];
    return b.children.length     === 1 &&
           b.children[0].tagName === "#text";
}

/**
 * Check if the row is the footer of the "Positions" records
 * @param {ASTElement} row
 * @return {boolean}
 */
function isEndOfPositionTableRow(row) {
    return Object.keys(row.attributes).length === 0 &&
           row.children.length     === 1    &&
           row.children[0].tagName === "td" &&
           row.children[0].children.length === 0;
}

/**
 * Parses a position row to a ReportPosition object.
 *
 * @param {ASTElement} row
 * @returns {ReportPosition}
 */
function parsePositionRow(row) {
    const texts = row.children.map((children) => getText(children));

    return {
        openTime  : Date.parse(texts[ 0]),
        posId     : parseInt  (texts[ 1], 10),
        symbol    :            texts[ 2],
        type      :            texts[ 3] === "Buy" ? LONG : SHORT,
        magic     : parseInt  (texts[ 4] || "0", 10),
        volume    : parseFloat(texts[ 5]),
        openPrice : parseFloat(texts[ 6]),
        closeTime : Date.parse(texts[ 9]),
        closePrice: parseFloat(texts[10]),
        profit    : parseFloat(texts[13]),
    };
}
