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

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

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

    const submitButton = await page.waitForXPath(
      '//button[starts-with(@class, "js-signin-submit")]'
    );
    await page.waitForTimeout(1000);
    if (submitButton) {
      await submitButton.click();
    } else {
      console.log("Button not found");
      return;
    }

    const isLogin = await page.waitForXPath('//div[@class="logoutheader"]');

    if (isLogin) {
      const username = await page.evaluate(() => {
        const link = document.querySelector("a[class=user-box]").href;
        const name = link.match(/(?<=\/)\w+$/)[0];
        console.log(name);
        return name;
      });
      await page.waitForTimeout(3000);

      if (!username) {
        console.log("Login failure");
        return;
      }

      //сохранение куки
      const cookies = await page.cookies();
      await fs.writeFileSync(
        `${__dirname}/cookies.json`,
        JSON.stringify(cookies, null, 2)
      );
      console.log(`Username: ${username}, succesfully login. Cookies saved`);
      //-----

      const menuLink = await page.waitForXPath(
        '//a[contains(@href, "/projects") and contains(@class, "header-menu-link")]',
        { visible: true }
      );

      await menuLink.click();
      await page.waitForTimeout(2000);

      const card = await page.waitForXPath(
        '//div[starts-with(@class,"card__content")]',
        {
          visible: true,
        }
      );

      if (!card) {
        console.log("Cant load page with orders");
      }

      const cards = await page.evaluate(() => {
        const title = document.querySelectorAll(".wants-card__header-title");
      });
      //div[contains(@class, "js-want-block-toggle-full")] -card description
      //div[contains(@class, "wants-card__price")] -card-price
    }
  }
})();
