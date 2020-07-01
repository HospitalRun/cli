#!/usr/bin/env node
import sade from 'sade'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version

import ddoc from './ddoc'

const prog = sade('hospitalrun')

prog.version(version)
ddoc(prog)

prog.parse(process.argv)
