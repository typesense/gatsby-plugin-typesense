const fs = require("fs").promises
const path = require("path")

exports.getHTMLFilesRecursively = async dir => {
  const dirEnts = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirEnts.map(dirEnt => {
      const fullPath = path.resolve(dir, dirEnt.name)
      if (dirEnt.isDirectory()) {
        return module.exports.getHTMLFilesRecursively(fullPath)
      } else if (path.extname(fullPath) === ".html") {
        return fullPath
      } else {
        return null
      }
    })
  )
  return files.flat().filter(e => e)
}

exports.isObjectEmpty = object => {
  return Object.keys(object).length === 0 && object.constructor === Object
}

exports.generateNewCollectionName = collectionSchema => {
  return `${collectionSchema.name}_${Date.now()}`
}
