const fs = require("fs");

const cookiesPath = `${__dirname}/../cookies.json`;

module.exports.checkCookies = () => {
  return new Promise((resolve, reject) => {
    let isExist = fs.existsSync(cookiesPath);

    if (isExist) {
      const cookies = fs.readFileSync(cookiesPath);
      resolve(cookies);
    } else {
      resolve();
    }
  });
};
