#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sade_1 = __importDefault(require("sade"));
const ddoc_1 = __importDefault(require("./ddoc"));
const prog = sade_1.default('hospitalrun');
prog.version('0.1.0');
ddoc_1.default(prog);
prog.parse(process.argv);
