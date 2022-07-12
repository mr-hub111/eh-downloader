const downloadEH = require("../app");

const {
    downloadSessionDB,
} = require("../engines/immDBs");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
const requestDownloadController = async (req, res) => {
    const url = new URL(req.query.download);
    const urlString = url.origin + url.pathname;
    if (!downloadSessionDB[urlString]) {
        downloadSessionDB[urlString] = {
            url: urlString,
            latestUpdate: null,
            status: 'ok',
            inprogress: false,
            logs: [],
            details: null,
            errors: [],
        };
    }

    if (
        (downloadSessionDB[urlString].latestUpdate === null) ||
        (downloadSessionDB[urlString].status === 'error' && ((new Date().valueOf() - new Date(downloadSessionDB[urlString].latestUpdate).valueOf()) > 100000 * 5)) ||
        ( downloadSessionDB[urlString].status === 'ok' && downloadSessionDB[urlString].inprogress === false && ((new Date().valueOf() - new Date(downloadSessionDB[urlString].latestUpdate).valueOf()) > 100000 * 60))
    ) {
        downloadSessionDB[urlString].latestUpdate = new Date();
        downloadSessionDB[urlString].status = 'downloading';
        downloadSessionDB[urlString].inprogress = true;
        downloadSessionDB[urlString].logs = [];
        downloadSessionDB[urlString].details = null;
        downloadSessionDB[urlString].errors = [];

        downloadEH(urlString, (log) => {
            downloadSessionDB[urlString].logs.push(log);
            console.log(log);
        })
            .then(r => {
                downloadSessionDB[urlString].details = r;
                downloadSessionDB[urlString].status = 'ok';
            })
            .catch(e => {
                console.error(e);
                downloadSessionDB[urlString].errors.push(e.message);
                downloadSessionDB[urlString].status = 'error';
            })
            .finally(() => {
                downloadSessionDB[urlString].inprogress = false;
            });

        res.status(200).json({ downloadSessionDB: downloadSessionDB[urlString] });
        return;
    }
    res.status(200).json({ downloadSessionDB: downloadSessionDB[urlString] });
    return;
};


module.exports = requestDownloadController;