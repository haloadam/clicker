const puppeteer = require('puppeteer');
const readline = require('readline');
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
}

async function start() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://sports.williamhill.com/betting/en-gb/tennis/OB_EV25677424/jordan-hasson-vs-daniel-rodrigues");

    await page.waitForSelector("#scoreboard_frame");
    await page.setViewport({ width: 810, height: 415 })
    await page.screenshot({
        path: "score.png",
        clip: {
            x: 380,
            y: 170,
            width: 90,
            height: 50
        }
    });

    while (true)
        await browser.close();
}
commandLine();