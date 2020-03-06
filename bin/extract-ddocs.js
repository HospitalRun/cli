"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const writeFile = util_1.default.promisify(fs_1.default.writeFile);
const readFIle = util_1.default.promisify(fs_1.default.readFile);
async function default_1(filename) {
    const dbBackup = (await readFIle(path_1.default.join(__dirname, filename))).toString();
    const main = JSON.parse(dbBackup.replace(/\]\n\[/g, ','));
    console.log(typeof main);
    const designDocuments = main.filter(doc => doc._id.startsWith('_design/'));
    await writeFile(path_1.default.join(__dirname, './design-documents.json'), JSON.stringify(designDocuments, null, 1));
}
exports.default = default_1;
