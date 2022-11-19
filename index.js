const { PendingXHR } = require('pending-xhr-puppeteer');
const { clearInterval } = require('timers');
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');
const puppeteer = require('puppeteer');
const point = require('./scores');
const robot = require('robotjs');

let id;
let isTop;

function commandLine() {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('Enter match ID and check top> ');
    rl.prompt();
    rl.on('line', function (line) {
        let input = line.split(" ");
        id = input[0];
        isTop = input[1].toLowerCase() === 'true' ? true : false;
        rl.close(id, isTop);
        rl.prompt();
    }).on('close', async function () {
        await start();
        //process.exit(0);
    });
}

async function start() {
    const browser = await puppeteer.launch({headless: true});
    console.log(id)
    console.log(isTop)
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
    const page = await browser.newPage();
    const pendingXHR = new PendingXHR(page);
    await page.goto(`https://sports.williamhill.com/betting/en-gb/tennis/${id}`);
    // Here all xhr requests are not finished
    await pendingXHR.waitForAllXhrFinished();

    let previousUuid = undefined;
    let interval = await setInterval(async () => {
        let currentUuid = crypto.randomUUID();
        await page.screenshot({ path: `screenshots/${currentUuid}.png`, clip: isTop ? point.top : point.bottom }).catch(e => console.error(e))
        console.log("screenshot taken with " + currentUuid);

        if (previousUuid && !compareImages(`screenshots/${previousUuid}.png`, `screenshots/${currentUuid}.png`)) {
            await clearInterval(interval);
            robot.mouseClick();
            await fs.rmSync('screenshots', { recursive: true, force: true });
            console.log('cleanup finished')
        }
        previousUuid = currentUuid;
    }, 5);
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

commandLine();