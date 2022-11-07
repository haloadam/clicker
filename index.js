const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
const point = require('./scores');
const crypto = require('crypto');
const fs = require('fs');
const path = require("path");
const { clearInterval } = require('timers');

/* const readline = require('readline');
const startTime = new Date().getUTCMilliseconds();
let finishTime;

function commandLine() {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('Enter desired time to fetch data> ');
    rl.prompt();
    rl.on('line', function (line) {
        let timeParts = line.split(" ");
        let multiplier = timeParts[0];
        switch (timeParts[1]) {
            case "M": {
                finishTime = startTime + (multiplier * 60000);
                break;
            }
            case "H": {
                finishTime = startTime + (multiplier * 3600000);
                break;
            }
            default: {
                rl.setPrompt("Error setting time units.");
                rl.prompt();
            }
        }
        rl.close();
        rl.prompt();
    }).on('close', function () {
        start();
        process.exit(0);
    });
} */
//TODO
// input link, input top or bottom, color difference finder algorithm

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function start() {
    console.log("start");
    const browser = await puppeteer.launch({ headless: false });
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
    const page = await browser.newPage();
    const pendingXHR = new PendingXHR(page);
    await page.goto(`https://sports.williamhill.com/betting/en-gb/tennis/OB_EV25769947/panna-udvardy-vs-timea-babos`);
    // Here all xhr requests are not finished
    await pendingXHR.waitForAllXhrFinished();


    let previousUuid = undefined;
    let interval = await setInterval(async () => {
        let currentUuid = crypto.randomUUID();
        await page.screenshot({ path: `screenshots/${currentUuid}.png`, clip: point.bottom }).catch(e => console.error(e))
        console.log("screenshot taken with " + currentUuid);

        if (previousUuid && !compareImages(`screenshots/${previousUuid}.png`, `screenshots/${currentUuid}.png`)) {
            await clearInterval(interval);
            console.log('clicked')
            await fs.readdir('screenshots').then((f) => Promise.all(f.map(e => fs.unlink(e))))
            console.log('cleanup finished')

        }
        previousUuid = currentUuid;
    }, 20);
}

function compareImages(imageOnePath, imageTwoPath) {
    if (!imageOnePath || !imageTwoPath)
        throw new Error('Image does not exist');
    if (imageOnePath === imageTwoPath)
        return true;
    var stats = fs.statSync(imageOnePath);
    var imageOneSize = stats.size;
    stats = fs.statSync(imageTwoPath);
    var imageTwoSize = stats.size;
    imageOneBytes = getByteArray(imageOnePath);
    imageTwoBytes = getByteArray(imageTwoPath);
    if (imageOneSize === imageTwoSize)
        for (let i = 0; i < imageOneSize; ++i) {
            if (imageOneBytes[i] !== imageTwoBytes[i])
                return false;
        }
    else
        return false;
    return true;
}

function getByteArray(filePath) {
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i += 2)
        result.push('0x' + fileData[i] + '' + fileData[i + 1])
    return result;
}

start();