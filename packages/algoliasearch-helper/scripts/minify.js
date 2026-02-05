#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");

const args = process.argv.slice(2);

if (args.length !== 4) {
  console.error(
    "Usage: node scripts/minify.js <input.js> <input.map> <output.js> <output.map>"
  );
  process.exit(1);
}

const [inputFile, inputMapFile, outputFile, outputMapFile] = args;

const inputCode = fs.readFileSync(inputFile, "utf8");
const inputMap = JSON.parse(fs.readFileSync(inputMapFile, "utf8"));

const outputMapName = path.basename(outputMapFile);
const outputFileName = path.basename(outputFile);

const result = UglifyJS.minify(
  { [path.basename(inputFile)]: inputCode },
  {
    fromString: true,
    inSourceMap: inputMap,
    outSourceMap: outputMapName,
    outFileName: outputFileName,
    compress: { warnings: false },
    mangle: true,
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

fs.writeFileSync(outputFile, result.code, "utf8");
fs.writeFileSync(outputMapFile, result.map, "utf8");
