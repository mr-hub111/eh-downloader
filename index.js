const express = require("express");
const requestDownloadMiddleware = require("./middlewares/requestDownload.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const requestDownloadController = require("./controllers/requestDownload.controller");
const eventsDownloadController = require("./controllers/eventsDownload.controller");
const server = express();

server.get('/',
    requestDownloadMiddleware,
    requestDownloadController,
);

server.get('/zip',
    requestDownloadMiddleware,
    eventsDownloadController
);

server.use(errorMiddleware);

server.listen(5000, () => {
    console.info(`Server is listen at port 80, http://localhost:5000`)
});