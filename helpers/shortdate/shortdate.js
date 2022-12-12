/**
 * units of time
 * ms, s, m, h, d, w, M, y
 */

const unitsOfTime = {
    ms: (n) => n,
    s: (n) => n * 1000,
    h: (n) => n * 1000 * 60 * 60,
    d: (n) => n * 1000 * 60 * 60 * 24,
    w: (n) => n * 1000 * 60 * 60 * 24 * 7,
    m: (n) => n * 1000 * 60 * 60 * 24 * 30,
    y: (n) => n * 1000 * 60 * 60 * 24 * 365,
};

const _separator = (unit) => {
    const [n, u] = unit.match(/[a-zA-Z]+|[0-9]+/g);

    if (Object.keys(unitsOfTime).indexOf(u) === -1) {
        throw new Error(`Invalid unit: ${u}`);
    }

    return [n, u];
};

/**
 *
 * @param {*} unit ms for milliseconds, s for seconds, h for hours, d for days, w for weeks, m for months, y for years
 * @returns {Date} a date object
 */
const shortdate = (unit) => {
    const [n, u] = _separator(unit);
    return new Date(Date.now() + unitsOfTime[u](n));
};

/**
 *
 * @param {*} unit ms for milliseconds, s for seconds, h for hours, d for days, w for weeks, m for months, y for years
 * @returns {Number} miliseconds since epoch
 */
const shortdatems = (unit) => {
    const [n, u] = _separator(unit);

    return Date.now() + unitsOfTime[u](n);
};

const getms = (unit) => {
    const [n, u] = _separator(unit);

    return unitsOfTime[u](n);
};

module.exports = { shortdate, shortdatems, getms };
