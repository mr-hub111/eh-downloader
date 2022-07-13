/**
 * It takes a URL, converts it to a URL object, then returns the origin and pathname of the URL object,
 * and removes the leading slash.
 * @param {string} url - The URL you want to convert.
 * @returns The newURLDeleteSlash is being returned.
 */
const utilURLConvert = (url) => {
    const newURL = new URL(url);
    const newURLDeleteSlash = (newURL.origin + newURL.pathname).replace(/\/$/, '');
    return newURLDeleteSlash;
};

module.exports = utilURLConvert;