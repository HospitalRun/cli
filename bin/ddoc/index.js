"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("./build"));
const extract_1 = __importDefault(require("./extract"));
exports.default = (prog) => {
    build_1.default(prog);
    extract_1.default(prog);
};
