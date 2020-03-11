import { test } from 'tap'
import { join } from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

import extract from '../src/ddoc/extract/extract'

const dummyData = join(__dirname, './dummy-data')

test('Should extract design documents from a backup', async (t: any) => {
  const destinationFolder = join(dummyData, 'output')
  await mkdirp(destinationFolder)

  t.test('to json', async () => {
    await extract(join(dummyData, 'main.txt'), {
      destination: destinationFolder,
      format: 'json',
      noVerbose: true,
    })
  })

  t.test('to JavaScript', async () => {
    await extract(join(dummyData, 'main.txt'), {
      destination: destinationFolder,
      format: 'js',
      noVerbose: true,
    })
  })

  t.test('to TypeScript', async () => {
    await extract(join(dummyData, 'main.txt'), {
      destination: destinationFolder,
      format: 'ts',
      noVerbose: true,
    })
  })

  t.tearDown(() => rimraf.sync(destinationFolder))
  t.end()
})
