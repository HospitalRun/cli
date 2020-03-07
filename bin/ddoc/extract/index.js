"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = __importDefault(require("./extract"));
exports.default = (prog) => {
    prog
        .command('ddoc extract <src>', `Extract design document(s) from database exported backup file. Expects <src> backup file.`)
        .option('-d, --destination', 'Destination folder.', '.')
        .option('-f, --format', 'Destination file format. Possible values are json or js.', 'json')
        .example('ddoc extract db/main.txt')
        .example('ddoc extract db/main.txt')
        .action(extract_1.default);
};
