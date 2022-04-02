const express = require("express");
const requestDownloadMiddleware = require("./middlewares/requestDownload.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const requestDownloadController = require("./controllers/requestDownload.controller");
const server = express();

server.get('/',
    requestDownloadMiddleware,
    requestDownloadController,
);

server.get('/events',
requestDownloadMiddleware);

server.use(errorMiddleware);

server.listen(8081, () => {
    console.info(`Server is listen at port 8081, http://localhost:8081`)
});