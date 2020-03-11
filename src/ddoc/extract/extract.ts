import fs from 'fs'
import util from 'util'
import path from 'path'
import mkdirp from 'mkdirp'
import chalk from 'chalk'
import { Type, Static } from '@sinclair/typebox'
import Ajv from 'ajv'

const ajv = new Ajv({})

const writeFile = util.promisify(fs.writeFile)
const readFIle = util.promisify(fs.readFile)

const FORMATS = ['js', 'json', 'ts']

const ViewsSchema = Type.Object({
  map: Type.Optional(Type.String()),
  reduce: Type.Optional(Type.String()),
})
const MapSchema = Type.Map(Type.String())

const DesignDocumentSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  _rev: Type.Optional(Type.String()),
  language: Type.Optional(Type.String()),
  autoupdate: Type.Optional(Type.Boolean()),
  options: Type.Optional(
    Type.Object({
      local_seq: Type.Optional(Type.Boolean()), // eslint-disable-line
      include_design: Type.Optional(Type.Boolean()), // eslint-disable-line
    }),
  ),
  views: Type.Optional(Type.Map(ViewsSchema)),
  updates: Type.Optional(MapSchema),
  filters: Type.Optional(MapSchema),
  validate_doc_update: Type.Optional(Type.String()), // eslint-disable-line
  shows: Type.Optional(MapSchema),
  lists: Type.Optional(MapSchema),
  rewrites: Type.Optional(Type.String()),
})

type DesignDocument = Static<typeof DesignDocumentSchema>

export default async function(
  src: string,
  opts: { destination: string; format: string; noVerbose?: boolean },
) {
  const methods = new Map<string, string>()
  try {
    if (!FORMATS.includes(opts.format)) {
      throw Error(`Wrong destination format provided ${opts.format}, must be one of ${FORMATS}`)
    }
    const srcPath = path.resolve(src)
    const dbBackup = (await readFIle(srcPath)).toString()

    if (!opts.noVerbose) {
      console.log(
        `> ${chalk.bgBlueBright(chalk.black(' ddoc extract src '))} ${chalk.cyan(srcPath)}`,
      )
    }

    const main = JSON.parse(dbBackup.replace(/\]\n\[/g, ',')) as any[]
    const designDocuments = main.filter(doc => doc._id.startsWith('_design/')) as DesignDocument[]
    const stats = {
      views: 0,
      updates: 0,
      filters: 0,
      validate_doc_update: 0, // eslint-disable-line
      shows: 0,
      lists: 0,
      rewrites: 0,
    }

    if (opts.format === 'json') {
      for (const doc of designDocuments) {
        ajv.validate(DesignDocumentSchema, doc)
        stats.views = stats.views + (doc.views ? 1 : 0)
        stats.updates = stats.updates + (doc.updates ? 1 : 0)
        stats.filters = stats.filters + (doc.filters ? 1 : 0)
        stats.validate_doc_update = stats.validate_doc_update + (doc.validate_doc_update ? 1 : 0) // eslint-disable-line
        stats.shows = stats.shows + (doc.shows ? 1 : 0)
        stats.lists = stats.lists + (doc.lists ? 1 : 0)
        stats.rewrites = stats.rewrites + (doc.rewrites ? 1 : 0)
      }

      const filename = `${path.basename(src, path.extname(src))}-designs.${opts.format}`
      const dest = path.resolve(path.join(opts.destination, filename))

      if (!opts.noVerbose) {
        console.log(`> ${chalk.bgBlueBright(chalk.black(' ddoc extract designs found '))}`)
        console.table(stats)
      }
      await mkdirp(path.dirname(dest))

      if (!opts.noVerbose) {
        console.log(
          `> ${chalk.bgGreenBright(chalk.black(' ddoc extract destination '))} ${chalk.cyan(dest)}`,
        )
      }

      await writeFile(dest, JSON.stringify(designDocuments, null, 1))
    } else {
      for (const doc of designDocuments) {
        if (!ajv.validate(DesignDocumentSchema, doc)) {
          throw Error(`The ${doc._id}-${doc._rev} schema is invalid.`)
        }
        if (doc.views) {
          stats.views = stats.views + 1
          for (const view of Object.keys(doc.views)) {
            if (doc.views[view].map) {
              const name = `${doc._id}-${doc._rev}.views.${view}.map`
              methods.set(name, doc.views[view].map!)
              doc.views[view].map = name
            }
            if (doc.views[view].reduce) {
              const name = `${doc._id}-${doc._rev}.views.${view}.reduce`
              methods.set(name, doc.views[view].reduce!)
              doc.views[view].reduce = name
            }
          }
        }
        if (doc.updates) {
          stats.updates = stats.updates + 1
          for (const update of Object.keys(doc.updates)) {
            const name = `${doc._id}-${doc._rev}.updates.${update}`
            methods.set(name, doc.updates[update])
            doc.updates[update] = name
          }
        }
        if (doc.filters) {
          stats.filters = stats.filters + 1
          for (const filter of Object.keys(doc.filters)) {
            const name = `${doc._id}-${doc._rev}.filters.${filter}`
            methods.set(name, doc.filters[filter])
            doc.filters[filter] = name
          }
        }
        if (doc.validate_doc_update) {
          stats.validate_doc_update = stats.validate_doc_update + 1 // eslint-disable-line
          const name = `${doc._id}-${doc._rev}.validate_doc_update`
          methods.set(name, doc.validate_doc_update)
          doc.validate_doc_update = name // eslint-disable-line
        }
        if (doc.shows) {
          stats.shows = stats.shows + 1
          for (const show of Object.keys(doc.shows)) {
            const name = `${doc._id}-${doc._rev}.shows.${show}`
            methods.set(name, doc.shows[show])
            doc.shows[show] = name
          }
        }
        if (doc.lists) {
          stats.lists = stats.lists + 1
          for (const list of Object.keys(doc.lists)) {
            const name = `${doc._id}-${doc._rev}.lists.${list}`
            methods.set(name, doc.lists[list])
            doc.lists[list] = name
          }
        }
        if (doc.rewrites) {
          stats.rewrites = stats.rewrites + 1
          const name = `${doc._id}-${doc._rev}.rewrites`
          methods.set(name, doc.rewrites)
          doc.rewrites = name
        }
      }

      if (!opts.noVerbose) {
        console.log(
          `> ${chalk.bgBlueBright(
            chalk.black(' ddoc extract designs creating destination folder '),
          )}`,
        )
      }

      const destFolder = path.resolve(
        path.join(opts.destination, `${path.basename(src, path.extname(src))}-designs`),
      )

      await mkdirp(destFolder)

      for (const doc of designDocuments) {
        const filename = `${doc._id?.split('_design/')[1]}-${doc._rev}.${
          opts.format === 'js' ? 'js' : 'ts'
        }`

        if (!opts.noVerbose) {
          console.log(
            `> ${chalk.bgBlueBright(chalk.black(` ddoc extract designs creating ${filename} `))}`,
          )
        }
        const dest = path.resolve(path.join(destFolder, filename))

        let docString =
          opts.format === 'js'
            ? `module.exports = ${JSON.stringify(doc, null, 1)}`
            : `export default ${JSON.stringify(doc, null, 1)}`

        for (const [name, method] of methods) {
          docString = docString.replace(`\"${name}\"`, method)
        }
        await writeFile(dest, docString)
      }

      if (!opts.noVerbose) {
        console.log(`> ${chalk.bgGreenBright(chalk.black(' ddoc extract designs done '))}`)
        console.table(stats)
      }
    }
  } catch (err) {
    console.error(chalk.bgRed(chalk.white(` ${err.message} `)))
    process.exit(1)
  }
}
