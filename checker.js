const puppeteer = require("puppeteer-extra");
const { checkCookies } = require("./utils/checkCookies");
const fs = require("fs");

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

require("dotenv").config();

const target = process.env.SITE;
const login = process.env.LOGIN;
const password = process.env.PASSWORD;

(async () => {
  const cookies = await checkCookies();

  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    slowMo: 30,
  });

  const page = await browser.newPage();

  if (cookies) {
    console.log("Set cookie");
    await page.setCookie(...cookies);
  }

  const options = {
    visible: true,
  };

  await page.goto(target, { waitUntil: "networkidle2" });
  const loginButton = await page.waitForXPath(
    '//*[@class="login-js"]',
    options
  );

  if (loginButton) {
    await loginButton.click();

    const loginInput = await page.waitForXPath(
      '//input[@name="l_username"]',
      options
    );

    const passwordInput = await page.waitForXPath(
      '//input[@name="l_password"]',
      options
    );

    await loginInput.type(login);
    await page.waitForTimeout(1000);
    await passwordInput.type(password);
    await page.waitForTimeout(1000);
    const submitButton = await page.$x(
      "//*[contains(@class, js-signin-submit)"
    );
    await submitButton.click();

    const isLogin = await page.waitForXPath('//div[@class="logoutheader"]');
    if (isLogin) {
      const userBox = await page.waitForXPath('//a[@class="user-box"]').href;
      console.log("Succesfully login into account: ");
      //(?<=\/)\w+$ xpath get username
    }
  }
})();
