import { Sade } from 'sade'

import build from './build'
import extract from './extract'

export default (prog: Sade) => {
  build(prog)
  extract(prog)
}
