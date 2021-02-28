const puppeteer = require('puppeteer');

const loadPage = async () => {
    const browser = await puppeteer.launch();
    console.log(await browser.version());
    const page = await browser.newPage();
    page.on('console', msg => {
        for (let i = 0; i < msg._args.length; ++i) {
            console.log(`${i}: ${msg._args[i]}`);
        }

    });

    await page.goto('http://localhost:8080/sample04/headless-page.html');

    const flagHandle = await page.evaluateHandle(() => document.querySelector('#signalingConnectionClosed'));

    const checkIfConnectionClosed = async () => {

        const signalingConnectionClosed = await flagHandle.evaluate(node => node.value);
        // console.log(signalingConnectionClosed);
        if(signalingConnectionClosed == 'true') {
            console.log('Reload the browser.');
            await browser.close();
            loadPage();
            return;
        }

        setTimeout(checkIfConnectionClosed, 1000);
    };
    await checkIfConnectionClosed();
};
loadPage();
