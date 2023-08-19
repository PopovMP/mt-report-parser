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
        countOfTrades   : positions.length,
        countBreakeven  : countBreakeven (positions),
        winLossRatio    : winLossRatio   (positions),
        maxConsecLooses : maxConsecLooses(positions),
    };
}

/**
 * Calculates the statistics of a given positions array grouped by symbol and magic number.
 *
 * @param {ReportPosition[]} positions
 * @return {{[symbol: string]: {[magic: number]: ReportStatistics}}}
 */
export function calculateGroupedStatistics(positions) {
    const groups = groupPositions(positions);

    /** @type {{[symbol: string]: {[magic: number]: ReportStatistics}}} */
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
 *
 * @return {{[symbol: string]: {[magic: number]: ReportStatistics}}}
 */
export function filterStatistics(positions, minCountOfTrades=0,
                                 minProfit=0, minProfitFactor=0, minWinLossRatio=0,
                                 minMaxConsecLooses=100) {

    /** @type {{[symbol: string]: {[magic: number]: ReportStatistics}}} */
    const result = {};

    /** @type {{[symbol: string]: {[magic: number]: ReportStatistics}}} */
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
