import originalGlob from 'glob'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import ts from 'typescript'
import requireFromString from 'require-from-string'
import mkdirp from 'mkdirp'
import chalk from 'chalk'

const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const glob = promisify(originalGlob)

async function deleteOldDdocs(dest: string) {
  const oldDdocs = await glob(path.join(dest, '**/*.json'))
  return Promise.all(oldDdocs.map(file => unlink(file)))
}

export default async function build(src: string, opts: { config: string }) {
  try {
    const tsconfigPath = path.resolve(opts.config)

    console.log(
      `> ${chalk.bgBlueBright(chalk.black(' ddoc build config '))} ${chalk.cyan(tsconfigPath)}`,
    )
    const tsconfig = require(tsconfigPath) // eslint-disable-line

    src = path.resolve(src) // eslint-disable-line
    let srcStats: any
    try {
      srcStats = await stat(src)
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(chalk.bgGreen(chalk.black(`\n ddoc build - No input files found. Done. `)))
        process.exit(0)
      }
      throw err
    }
    // use outDir if specified inside tsconfig, otherwise build json alongside ts files
    let dest: string = tsconfig?.compilerOptions?.outDir
      ? path.join(path.dirname(tsconfigPath), tsconfig.compilerOptions.outDir)
      : ''
    let ddocs: string[]
    if (srcStats.isDirectory()) {
      dest = dest || src
      ddocs = await glob(path.join(src, '**/*.ts'))
    } else {
      dest = dest || path.dirname(src)
      ddocs = [src]
    }

    console.log(`> ${chalk.bgBlueBright(chalk.black(' ddoc build src '))} ${chalk.cyan(src)}`)
    await mkdirp(dest)
    await deleteOldDdocs(dest)
    console.log(`> ${chalk.bgBlueBright(chalk.black(' ddoc build dest '))} ${chalk.cyan(dest)}`)

    const errors: { file: string; error: Error }[] = []
    await Promise.all(
      ddocs.map(async srcPath => {
        try {
          const sourceFile = (await readFile(srcPath)).toString()
          const output = ts.transpileModule(sourceFile, tsconfig)
          const filename = path.basename(srcPath, '.ts')
          const ddoc = requireFromString(output.outputText)

          const stringifiedDesign = JSON.stringify(
            ddoc.default ?? ddoc,
            (_, val) => {
              if (typeof val === 'function') {
                return val.toString()
              }
              return val
            },
            1,
          )
          await writeFile(path.join(dest, `${filename}.json`), stringifiedDesign)
        } catch (error) {
          errors.push({ file: srcPath, error })
        }
      }),
    )
    if (errors.length > 0) {
      errors.forEach(err => {
        console.log(
          `\n> ${chalk.bgRed(chalk.white(' ddoc build compile error '))} ${chalk.cyan(
            err.file,
          )}${err.error.stack?.toString()}\n`,
        )
      })
      throw new Error(
        `ddoc compilation failed. Resolve errors ${errors.length} ${
          errors.length > 1 ? 'files' : 'file'
        } and try again.`,
      )
    }
    console.log(chalk.bgGreen(chalk.black(`\n ddoc build - done on ${ddocs.length} files. `)))
  } catch (err) {
    console.error(chalk.bgRed(chalk.white(` ${err.message} `)))
    process.exit(1)
  }
}
