const { isError, isString, isPlainObject } = require("lodash");

/**
 * If the error is an Error object, log it and send it back to the client. If the error is a string,
 * log it and send it back to the client. If the error is a plain object, log it and send it back to
 * the client. Otherwise, log the error and send a generic server error message back to the client
 * @param {object|string|Error} err  - The error object.
 * @param {import("express").Request} req  - The request object.
 * @param {import("express").Response} res  - The response object.
 * @param {import("express").NextFunction} next  - The next middleware in the chain.
 */
const errorMiddleware = (err, req, res, next) => {
    if (isError(err)) {
        console.error(err);
        res.status(500).send(err.message);
        next();
        return;
    }
    else if (isString(err)) {
        console.error(err);
        res.status(500).send(err);
        next();
        return;
    }
    else if (isPlainObject(err)) {
        console.error(err);
        res.status(500).send(JSON.stringify(err));
        next();
        return;
    }
    else {
        console.error(err);
        res.status(500).send('Server is error!');
        next();
        return;
    }
};

module.exports = errorMiddleware;