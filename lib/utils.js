const fs = require("fs").promises
const path = require("path")

exports.getHTMLFilesRecursively = async (dir, rootDir, exclude) => {
  const dirEnts = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirEnts.map(dirEnt => {
      const fullPath = path.resolve(dir, dirEnt.name)
      if (dirEnt.isDirectory()) {
        // if (dir === rootDir && excl && excl.includes(dirEnt.name)) {
        //   return null
        // }
        return module.exports.getHTMLFilesRecursively(fullPath, rootDir, exclude)
      } else if (path.extname(fullPath) === ".html") {
        // check against exlclude
        if (exclude.test(fullPath.substr(rootDir.length))) {
          console.log(`Excluding ${fullPath}`)
          return null
        }
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
