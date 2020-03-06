import fs from 'fs'
import util from 'util'
import path from 'path'

const writeFile = util.promisify(fs.writeFile)
const readFIle = util.promisify(fs.readFile)

export default async function(filename: string) {
  const dbBackup = (await readFIle(path.join(__dirname, filename))).toString()

  const main = JSON.parse(dbBackup.replace(/\]\n\[/g, ',')) as any[]
  console.log(typeof main)

  const designDocuments = main.filter(doc => doc._id.startsWith('_design/'))

  await writeFile(
    path.join(__dirname, './design-documents.json'),
    JSON.stringify(designDocuments, null, 1),
  )
}
