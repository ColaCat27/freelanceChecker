const puppeteer = require("puppeteer-extra");

require("dotenv").config();

const target = process.env.SITE;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
  });

  const page = await browser.newPage();

  await page.goto(target, { waitUntil: "DOMContentLoaded" });
})();
