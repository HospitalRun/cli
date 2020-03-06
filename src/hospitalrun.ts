#!/usr/bin/env node
import sade from 'sade'

import ddoc from './ddoc'

const prog = sade('hospitalrun')

prog.version('0.1.0')
ddoc(prog)

prog.parse(process.argv)
