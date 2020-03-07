import { Sade } from 'sade'
import build from './build'

export default (prog: Sade) => {
  prog
    .command(
      'ddoc build <src>',
      'Build design document(s) from TypeScript. Expects TypeScript <src> folder or file.',
    )
    .option('-c, --config', 'Provide path to custom tsconfig.json', './tsconfig.json')
    .example('ddoc build src/db/designs')
    .example('ddoc build src/db/designs/patient.ts -c src/db/tsconfig.json')
    .action(build)
}
