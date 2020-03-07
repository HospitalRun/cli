"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("./build"));
exports.default = (prog) => {
    prog
        .command('ddoc build <src>', 'Build design document(s) from TypeScript. Expects TypeScript <src> folder or file.')
        .option('-c, --config', 'Provide path to custom tsconfig.json', './tsconfig.json')
        .example('ddoc build src/db/designs')
        .example('ddoc build src/db/designs/patient.ts -c src/db/tsconfig.json')
        .action(build_1.default);
};
