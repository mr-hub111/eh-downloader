const axios = require('axios').default;
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

/**
 * Given a URL, get the page details from the page
 * @template T
 * @param {string} [url] - The URL of the page to scrape.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called with a string parameter.
 * @returns {url: string; pageDetails: Array<{page: string, url: string}>;}
 */
const getPageDetails = async (url = '', logCallback) => {
    const config = {
        method: 'get',
        url: url
    };

    const response = await axios(config);

    const $ = cheerio.load(response.data);

    /**
     * @type {Array<{page: string, url: string}>}
     */
    const pageDetails = Array.from($("body > div:nth-child(9) > table > tbody > tr").children())
        .map(
            (where, index) => {
                if (where.children && Array(where.children).length > 0) {
                    if (where.children[0].children && Array(where.children[0].children).length > 0) {
                        if (/^[0-9]+$/.test(where.children[0].children[0].data)) {
                            return { page: where.children[0].children[0].data, url: where.children[0].attribs.href };
                        }
                    }
                }
            }
        )
        .filter(where => where);

    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `contains ${pageDetails.length} pages`
            }
        );
    }

    return { url, pageDetails };
};


/**
 * Get the gallery details from the page
 * @template T
 * @param {string} [url] - The url of the page you want to scrape.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called with a string parameter.
 * @returns {Promise<{url: string; pageGalleryDetails: string[];}>} an object with the url and the array of the image urls.
 */
const getPageGelleryDetails = async (url = '', logCallback) => {
    const config = {
        method: 'get',
        url: url
    };

    const response = await axios(config);

    const $ = cheerio.load(response.data);

    const pageGalleryDetails = Array.from($("#gdt").children())
        .map(
            (where, index) => {
                if ($(`#gdt > div:nth-child(${index}) > div > a`).attr('href')) {
                    return $(`#gdt > div:nth-child(${index}) > div > a`).attr('href');
                }
            }
        )
        .filter(where => where);

    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `contains ${pageGalleryDetails.length} images`
            }
        );
    }

    return { url, pageGalleryDetails };
};


/**
 * Get the image url from the page
 * @template T
 * @param {string} [url] - The URL of the image.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called with the log message.
 * @returns {Promise<string>} The image source.
 */
const getImageDetail = async (url = '', logCallback) => {
    const config = {
        method: 'get',
        url: url,
    };

    const response = await axios(config);

    const $ = cheerio.load(response.data);

    /**
     * This is a JavaScript expression that returns the value of the `src` attribute of the `#img` element.
     */
    const imageAttrSrc = $('#img').attr("src");

    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `detect #img.src`
            }
        );
    }

    return imageAttrSrc;
};


/**
 * Downloads an image from a URL and saves it to a local file
 * @template T
 * @param {string} [url] - The URL of the image to download.
 * @param {string} downloadFolder - The folder where the image will be downloaded.
 * @param {string} [fileName] - The name of the file to be saved.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called with the local file path of the downloaded
 * image.
 * @returns The file path to the downloaded image.
 */
const downloadImage = async (url = '', downloadFolder, fileName = Date.now().toString(), logCallback) => {
    /**
     * @type {import("axios").AxiosRequestConfig}
     */
    const config = {
        method: 'get',
        url: url,
        responseType: 'stream',
        timeout: 60000
    };

    const response = await axios(config);

    /**
     * @type {string}
     */
    const wr = await new Promise((reslove, reject) => {
        try {
            const localFilePath = path.resolve(__dirname, downloadFolder, `${fileName}.jpeg`);
            const w = response.data.pipe(fs.createWriteStream(localFilePath));
            w.on('finish', () => {
                reslove(localFilePath);
            });
            w.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });

    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `write file is complete at path ${wr}`
            }
        );
    }

    return wr;
};


/**
 * Download an image from a URL and save it to a folder
 * @template T
 * @param {number} [imageNumber=0] - The number of the image to download.
 * @param {string} [urlImage] - The URL of the image to download.
 * @param {string} [downloadFolder] - The folder where the images will be downloaded.
 * @param {number} [retryDownload=5] - The number of retry to download the image.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called with the downloaded image path.
 * @returns {Promise<string>} The image path.
 */
const handleDownloadImage = async (imageNumber = 0, urlImage = '', downloadFolder = '', retryDownload = 5, logCallback) => {
    if (retryDownload === 0) {
        throw Error(`Download is out of retry`);
    }
    else {
        const downloadedImage = await downloadImage(urlImage, downloadFolder, String(imageNumber).padStart(3, '0'))
            .catch(async () => {
                if (logCallback) {
                    logCallback(
                        {
                            logDate: new Date(),
                            logType: 'warning',
                            imageNumber: imageNumber,
                            url: url,
                            descriptions: `retry download (${retryDownload})`
                        }
                    );
                }
                return await handleDownloadImage(imageNumber, urlImage, downloadFolder, retryDownload - 1, logCallback);
            });

        if (logCallback) {
            logCallback(
                {
                    logDate: new Date(),
                    logType: 'info',
                    imageNumber: imageNumber,
                    urlImage: urlImage,
                    descriptions: `download complete at path ${downloadedImage}`
                }
            );
        }

        return downloadedImage;
    }
};


/**
 * Given a URL, get the page details and recursively call the function with the next page URL
 * @template T
 * @param {string} [url] - The URL of the page to be scraped.
 * @param {Array<{page: string, url: string}>} [pageURLs] - an array of page URLs that we want to crawl.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} logCallback - A function that will be called when the script is running.
 * @returns {Promise<Array<{page: string, url: string}>>} an array of objects that contain the page and url.
 */
const initPage = async (url = '', pageURLs = [], logCallback) => {
    const resPageDetails = await getPageDetails(url);
    for (let index = 0; index < resPageDetails.pageDetails.length; index++) {
        const element = resPageDetails.pageDetails[index];
        const findDuplicatePage = pageURLs.findIndex(w => w.page === element.page);
        if (findDuplicatePage < 0) {
            pageURLs.push(element);
            if (index + 1 < resPageDetails.pageDetails.length) {
                return await initPage(resPageDetails.pageDetails[index + 1].url, pageURLs);
            }
        }
    }

    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `init page`
            }
        );
    }

    return pageURLs;
};


/**
 * It downloads all the images from a given URL.
 * @template T
 * @param {string} [url] - The URL of the gallery you want to download.
 * @param {(log: {logDate: Date, logType?: string, url?: string, urlImage?: string, pageNumber?: number, imageNumber?: number, descriptions?: descriptions}) => T} [logCallback] - A function that will be called with the log data.
 * @returns The downloadALL is an array of promises. Each promise is a download of an image.
 */
const downloadEH = async (url = '', logCallback = (log) => console.log({ data: log })) => {
    const URLpaths = new URL(url).pathname.split('/').filter(w => w);
    const downloadFolder = path.join(__dirname, 'img', URLpaths[1], URLpaths[2]);
    fs.mkdirSync(downloadFolder, { recursive: true, mode: 0o777 })
    const pageLists = await initPage(url);
    if (logCallback) {
        logCallback(
            {
                logDate: new Date(),
                logType: 'info',
                url: url,
                descriptions: `contains page ${pageLists.length}`
            }
        );
    }
    let imageNumber = 0;

    const downloadImageLists = [];
    for (let index = 0; index < pageLists.length; index++) {
        const element = pageLists[index];
        const responseGallery = await getPageGelleryDetails(element.url);
        if (logCallback) {
            logCallback(
                {
                    logDate: new Date(),
                    logType: 'info',
                    url: url,
                    pageNumber: index + 1,
                    descriptions: `contain images ${responseGallery.pageGalleryDetails.length}`
                }
            );
        }
        for (let idx = 0; idx < responseGallery.pageGalleryDetails.length; idx++) {
            ++imageNumber;
            const elementImage = responseGallery.pageGalleryDetails[idx];
            const urlImage = await getImageDetail(elementImage);
            downloadImageLists.push({ imageNumber, urlImage });
        }
    }

    /**
     * A loop that will download all the images from the given URL.
     * @type {string[]}
     */
    const procALL = [];
    for (let index = 0; index < downloadImageLists.length; index++) {
        const element = downloadImageLists[index];
        procALL.push(handleDownloadImage(element.imageNumber, element.urlImage, downloadFolder, 10, logCallback));
    }

    const downloadALL = await Promise.all(procALL);

    return {
        URL: url,
        URLPaths: [URLpaths[1], URLpaths[2]],
        downloadDirectory: downloadFolder,
        imageURLs: downloadALL,
    };
};


module.exports = downloadEH;