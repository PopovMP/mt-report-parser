import {getElementsByTagName} from "@popovmp/html-ast";

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
 * @property {string} tagName
 * @property {{string: string}} attributes
 * @property {ASTElement[]} children
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
    return b.children.length     === 1       &&
           b.children[0].tagName === "#text" &&
           b.children[0].value   === "Positions";
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
    return {
        openTime  : parsePosDate(row.children[ 0].children[0].value),
        posId     : parseInt    (row.children[ 1].children[0].value),
        symbol    :              row.children[ 2].children[0].value,
        type      :              row.children[ 3].children[0].value === "Buy" ? LONG : SHORT,
        magic     : parseMagic  (row.children[ 4]),
        volume    : parseFloat  (row.children[ 5].children[0].value),
        openPrice : parseFloat  (row.children[ 6].children[0].value),
        closeTime : parsePosDate(row.children[ 9].children[0].value),
        closePrice: parseFloat  (row.children[10].children[0].value),
        profit    : parseFloat  (row.children[13].children[0].value),
    };
}

/**
 * Parses a date string to a timestamp.
 *
 * @param {string} dateText
 * @return {number}
 */
function parsePosDate(dateText) {
    return Date.parse(dateText);
}

/**
 * Parses the magic number from the HTML report AST.
 * If the magic number is not found, returns 0.
 *
 * @param {ASTElement} td
 * @return {number}
 */
function parseMagic(td) {
    return td.children.length === 1
        ? parseInt(td.children[0].value)
        : 0;
}

/**
 * Groups positions by symbol and magic number.
 *
 * @param {ReportPosition[]} positions
 * @return {Object.<string, Object.<number, ReportPosition[]>>}
 */
export function groupPositions(positions) {
    const groups = {};

    for (const position of positions) {
        const symbol = position.symbol;
        const magic  = position.magic;

        if (!groups[symbol]) {
            groups[symbol] = {};
        }
        if (!groups[symbol][magic]) {
            groups[symbol][magic] = [];
        }

        groups[symbol][magic].push(position);
    }

    return groups;
}

/**
 * Calculates the gross profit of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function grossProfit(positions) {
    return positions.reduce((sum, position) => sum + Math.max(position.profit, 0), 0);
}

/**
 * Calculates the gross loss of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function grossLoss(positions) {
    return positions.reduce((sum, position) => sum + Math.min(position.profit, 0), 0);
}

/**
 * Calculates the net profit of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function netProfit(positions) {
    return positions.reduce((sum, position) => sum + position.profit, 0);
}

/**
 * Calculates the profit factor of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function profitFactor(positions) {
    const profit = grossProfit(positions);
    const loss   = grossLoss  (positions);

    return loss === 0 ? profit : -profit / loss;
}

/**
 * Calculates the count of the profitable positions
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function countProfitable(positions) {
    return positions.filter(position => position.profit > 0).length;
}

/**
 * Calculates the count of the loosing positions
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function countLoosing(positions) {
    return positions.filter(position => position.profit < 0).length;
}

/**
 * Calculates the count of the breakeven positions
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function countBreakeven(positions) {
    return positions.filter(position => position.profit === 0).length;
}

/**
 * Calculates the Win/Loss ratio of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function winLossRatio(positions) {
    const profitable = countProfitable(positions);

    return positions.length === 0 ? 0 : profitable / positions.length;
}

/**
 * Calculates the count of maximum consecutive loosing positions
 *
 * @param {ReportPosition[]} positions
 * @return {number}
 */
export function maxConsecLooses(positions) {
    let maxLosses     = 0;
    let currentLosses = 0;

    for (const position of positions) {
        if (position.profit < 0) {
            currentLosses += 1;
        } else {
            maxLosses     = Math.max(maxLosses, currentLosses);
            currentLosses = 0;
        }
    }

    return maxLosses;
}

/**
 * Calculates statistics of a given positions array.
 *
 * @param {ReportPosition[]} positions
 * @return {ReportStatistics}
 */
export function calculateStatistics(positions) {
    return {
        grossProfit     : grossProfit    (positions),
        grossLoss       : grossLoss      (positions),
        netProfit       : netProfit      (positions),
        profitFactor    : profitFactor   (positions),
        countProfitable : countProfitable(positions),
        countLoosing    : countLoosing   (positions),
        countOfTrades     : positions.length,
        countBreakeven  : countBreakeven (positions),
        winLossRatio    : winLossRatio   (positions),
        maxConsecLooses : maxConsecLooses(positions),
    };
}

/**
 * Calculates the statistics of a given positions array grouped by symbol and magic number.
 *
 * @param {ReportPosition[]} positions
 * @return {Object.<string, Object.<number, ReportStatistics>>}
 */
export function calculateGroupedStatistics(positions) {
    const groups = groupPositions(positions);
    const result = {};

    for (const symbol of Object.keys(groups)) {
        result[symbol] = {};

        for (const magic of Object.keys(groups[symbol])) {
            result[symbol][magic] = calculateStatistics(groups[symbol][magic]);
        }
    }

    return result;
}

/**
 * Filter a statistics group by given statistic metrics.
 *
 * @param {ReportPosition[]} positions
 * @param {number} [minCountOfTrades=0]
 * @param {number} [minProfit=0]
 * @param {number} [minProfitFactor=0]
 * @param {number} [minWinLossRatio=0]
 * @param {number} [minMaxConsecLooses=10]
 */
export function filterStatistics(positions, minCountOfTrades=0,
                                 minProfit=0, minProfitFactor=0, minWinLossRatio=0,
                                 minMaxConsecLooses=100) {
    const result     = {};
    const statistics = calculateGroupedStatistics(positions);

    for (const symbol in statistics) {
        result[symbol] = {};

        for (const magic in statistics[symbol]) {
            const stats = statistics[symbol][magic];

            if (stats.countOfTrades   >= minCountOfTrades   &&
                stats.netProfit       >= minProfit          &&
                stats.profitFactor    >= minProfitFactor    &&
                stats.winLossRatio    >= minWinLossRatio    &&
                stats.maxConsecLooses <= minMaxConsecLooses) {
                result[symbol][magic] = stats;
            }
        }
    }

    return result;
}
