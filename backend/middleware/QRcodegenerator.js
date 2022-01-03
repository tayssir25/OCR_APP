var QRCode = require("qrcode");
const generateQR = (stringData) => {
  QRCode.toString(stringData, function (err, url) {
    if (err) console.log(err);
    stringData = url;
  });

  QRCode.toDataURL(stringData, function (err, url) {
    if (err) return console.log(err);
  });
  return stringData;
};
module.exports = generateQR;
