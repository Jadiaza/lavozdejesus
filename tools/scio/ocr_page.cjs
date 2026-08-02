const tesseract = require("tesseract.js");

tesseract.recognize(process.argv[2], "spa")
  .then(function (result) {
    process.stdout.write(result.data.text);
  })
  .catch(function (error) {
    console.error(error);
    process.exit(1);
  });
