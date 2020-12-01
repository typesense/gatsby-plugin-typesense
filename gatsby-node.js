const fs = require("fs").promises
const cheerio = require("cheerio")
const TypesenseClient = require("typesense").Client
const TYPESENSE_ATTRIBUTE_NAME = "data-typesense-field"

let utils = require("./lib/utils")

function typeCastValue(fieldDefinition, attributeValue) {
  if (fieldDefinition.type.includes("int")) {
    return parseInt(attributeValue);
  }
  if (fieldDefinition.type.includes("float")) {
    return parseFloat(attributeValue);
  }
  if (fieldDefinition.type.includes("bool")) {
    if (attributeValue.toLowerCase() === "false") {
      return false;
    }
    if (attributeValue === "0") {
      return false;
    }
    return attributeValue.trim() !== "";
  }
  return attributeValue;
}

async function indexContentInTypesense({
  fileContents,
  wwwPath,
  typesense,
  newCollectionSchema,
  reporter,
}) {
  const $ = cheerio.load(fileContents)

  let typesenseDocument = {}
  $(`[${TYPESENSE_ATTRIBUTE_NAME}]`).each((index, element) => {
    const attributeName = $(element).attr(TYPESENSE_ATTRIBUTE_NAME)
    const attributeValue = $(element).text()
    const fieldDefinition = newCollectionSchema.fields.find(
      f => f.name === attributeName
    )

    if (!fieldDefinition) {
      const errorMsg = `[Typesense] Field "${attributeName}" is not defined in the collection schema`
      reporter.panic(errorMsg)
      return Promise.error(errorMsg)
    }

    if (fieldDefinition.type.includes("[]")) {
      typesenseDocument[attributeName] = typesenseDocument[attributeName] || []
      typesenseDocument[attributeName].push(typeCastValue(fieldDefinition, attributeValue))
    } else {
      typesenseDocument[attributeName] = typeCastValue(fieldDefinition, attributeValue);
    }
  })

  if (utils.isObjectEmpty(typesenseDocument)) {
    reporter.warn(
      `[Typesense] No HTMLelements had the ${TYPESENSE_ATTRIBUTE_NAME} attribute, skipping page`
    )
    return Promise.resolve()
  }

  typesenseDocument["page_path"] = wwwPath
  typesenseDocument["page_priority_score"] =
    typesenseDocument["page_priority_score"] || 10

  try {
    reporter.verbose(
      `[Typesense] Creating document: ${JSON.stringify(
        typesenseDocument,
        null,
        2
      )}`
    )

    await typesense
      .collections(newCollectionSchema.name)
      .documents()
      .create(typesenseDocument)

    reporter.verbose("[Typesense] ✅")
    return Promise.resolve()
  } catch (error) {
    reporter.panic(`[Typesense] Could not create document: ${error}`)
  }
}

exports.onPostBuild = async (
  { reporter },
  {
    server,
    collectionSchema,
    publicDir,
    generateNewCollectionName = utils.generateNewCollectionName,
  }
) => {
  reporter.verbose("[Typesense] Getting list of HTML files")
  const htmlFiles = await utils.getHTMLFilesRecursively(publicDir)

  const typesense = new TypesenseClient(server)
  const newCollectionName = generateNewCollectionName(collectionSchema)
  const newCollectionSchema = { ...collectionSchema }
  newCollectionSchema.name = newCollectionName

  try {
    reporter.verbose(`[Typesense] Creating collection ${newCollectionName}`)
    await typesense.collections().create(newCollectionSchema)
  } catch (error) {
    reporter.panic(
      `[Typesense] Could not create collection ${newCollectionName}: ${error}`
    )
  }

  for (const file of htmlFiles) {
    const wwwPath = file.replace(publicDir, "").replace(/index\.html$/, "")
    reporter.verbose(`[Typesense] Indexing ${wwwPath}`)
    const fileContents = (await fs.readFile(file)).toString()
    await indexContentInTypesense({
      fileContents,
      wwwPath,
      typesense,
      newCollectionSchema,
      reporter,
    })
  }

  let oldCollectionName
  try {
    oldCollectionName = (
      await typesense.aliases(collectionSchema.name).retrieve()
    )["collection_name"]
    reporter.verbose(`[Typesense] Old collection name was ${oldCollectionName}`)
  } catch (error) {
    reporter.verbose(`[Typesense] No old collection found, proceeding`)
  }

  try {
    reporter.verbose(
      `[Typesense] Upserting alias ${collectionSchema.name} -> ${newCollectionName}`
    )
    await typesense
      .aliases()
      .upsert(collectionSchema.name, { collection_name: newCollectionName })

    reporter.info(
      `[Typesense] Content indexed to "${collectionSchema.name}" [${newCollectionName}]`
    )
  } catch (error) {
    reporter.error(
      `[Typesense] Could not upsert alias ${collectionSchema.name} -> ${newCollectionName}: ${error}`
    )
  }

  try {
    if (oldCollectionName) {
      reporter.verbose(
        `[Typesense] Deleting old collection ${oldCollectionName}`
      )
      await typesense.collections(oldCollectionName).delete()
    }
  } catch (error) {
    reporter.error(
      `[Typesense] Could not delete old collection ${oldCollectionName}: ${error}`
    )
  }
}

exports.onPreInit = ({ reporter }) =>
  reporter.verbose("Loaded gatsby-plugin-typesense")
