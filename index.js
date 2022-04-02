const downloadEH = require("./app");

downloadEH('https://e-hentai.org/g/2181515/8654441159/', (log) => { console.log(log); })
    .then(r => {
        console.log(r);
    })
    .catch(e => {
        console.error(e);
    });
