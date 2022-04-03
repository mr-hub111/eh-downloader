const { isString } = require("lodash");

/**
 * If the query string is not a download URL, then the request is rejected
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function in the chain.
 */
const requestDownloadMiddleware = (req, res, next) => {
    if (!isString(req.query.download)) {
        next({ logDate: new Date(), url: req.originalUrl, error: 'require query download' });
    } else {
        const url = new URL(req.query.download);

        if (url.host !== 'e-hentai.org') {
            next({ logDate: new Date(), url: req.originalUrl, error: 'query download is mismatch' });
        }
        else if (/^\/g\/([\w\d])+\/{1}([\w\d])+(\/)?$/.test(url.pathname) === false) {
            next({ logDate: new Date(), url: req.originalUrl, error: 'query download is mismatch' });
        }
        else {
            req.query.download = new URL(req.query.download).origin + new URL(req.query.download).pathname;
            req.query.download = req.query.download.replace(/\/{1}$/, '');

            next();
        }
    }
};


module.exports = requestDownloadMiddleware;