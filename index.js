const downloadEH = require("./app");

downloadEH('https://e-hentai.org/g/2175684/c0f4631fbd/', (log) => { console.log(log); })
    .then(r => {
        console.log(r);
    })
    .catch(e => {
        console.error(e);
    });
