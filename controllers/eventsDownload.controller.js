const archiver = require("archiver");
const { downloadSessionDB } = require("../engines/immDBs");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
const eventsDownloadController = async (req, res) => {
    const url = new URL(req.query.download);
    const urlString = url.toString();

    if (downloadSessionDB[urlString]) {
        if (downloadSessionDB[urlString].tStorage) {
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            const tStorage = downloadSessionDB[urlString].tStorage;
            for (const key in tStorage) {
                if (Object.hasOwnProperty.call(tStorage, key)) {
                    const element = tStorage[key];
                    const bufferFile = Buffer.from(element.steamPipe);
                    archive.append(bufferFile, { name: key });
                }
            }
            res.attachment('download.zip').type('zip');
            archive.on('error', (e) => {
                throw e;
            });
            archive.on('end', () => res.end()); // end response when archive stream ends
            archive.pipe(res);
            archive.finalize();
            return;
        }
    }

    res.status(404);
    res.end();
    return;
};

module.exports = eventsDownloadController;