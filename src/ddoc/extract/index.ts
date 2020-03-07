import { Sade } from 'sade'
import extract from './extract'

export default (prog: Sade) => {
  prog
    .command(
      'ddoc extract <src>',
      `Extract design document(s) from database exported backup file. Expects <src> backup file.`,
    )
    .option('-d, --destination', 'Destination folder.', '.')
    .option('-f, --format', 'Destination file format. Possible values are json or js.', 'json')
    .example('ddoc extract db/main.txt')
    .example('ddoc extract db/main.txt')
    .action(extract)
}
