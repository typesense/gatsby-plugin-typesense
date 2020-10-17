const axios = require("axios")
const MockAxiosAdapter = require("axios-mock-adapter")
const rewire = require("rewire")

const gatsbyNode = rewire("../gatsby-node")

describe("gatsby-node.js", () => {
  let mockAxios

  const COLLECTION_SCHEMA = {
    name: "pages_v1",
    fields: [
      {
        name: "title",
        type: "string",
      },
      {
        name: "description",
        type: "string",
      },
      {
        name: "page_path",
        type: "string",
      },
      {
        name: "page_priority_score",
        type: "int32",
      },
    ],
    default_sorting_field: "page_priority_score",
  }

  const SERVER_CONFIG = {
    apiKey: "xyz",
    nodes: [
      {
        host: "localhost",
        port: "8108",
        protocol: "http",
      },
    ],
  }

  const NEW_COLLECTION_NAME = `pages_v1_${Date.now()}`

  const REPORTER = {
    info: jest.fn(/*msg => console.info(msg)*/),
    verbose: jest.fn(/*msg => console.log(msg)*/),
    panic: jest.fn(msg => {
      throw msg
    }),
    error: jest.fn(msg => {
      throw msg
    }),
    activityTimer: () => {
      return { start: jest.fn(), end: jest.fn() }
    },
  }

  beforeEach(() => {
    gatsbyNode.__set__(
      "generateNewCollectionName",
      jest.fn(() => NEW_COLLECTION_NAME)
    )
    mockAxios = new MockAxiosAdapter(axios)
    mockAxios
      .onPost("http://localhost:8108/collections", undefined, {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
      })
      .reply(config => {
        // console.log(config)
        if (
          JSON.stringify(JSON.parse(config.data).fields) ===
            JSON.stringify(COLLECTION_SCHEMA.fields) &&
          JSON.parse(config.data).name === NEW_COLLECTION_NAME
        ) {
          return [201, "{}", { "content-type": "application/json" }]
        }
      })

    mockAxios
      .onPost(
        `http://localhost:8108/collections/${NEW_COLLECTION_NAME}/documents`,
        {
          title: "Home",
          description: "This is some home page content",
          page_path: "/",
          page_priority_score: 10,
        },
        {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
        }
      )
      .reply(config => {
        // console.log(config)
        return [201, "{}", { "content-type": "application/json" }]
      })

    mockAxios
      .onPost(
        `http://localhost:8108/collections/${NEW_COLLECTION_NAME}/documents`,
        {
          title: "About",
          description: "This is some about us content",
          page_path: "/about/",
          page_priority_score: 10,
        },
        {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
        }
      )
      .reply(config => {
        // console.log(config)
        return [201, "{}", { "content-type": "application/json" }]
      })

    mockAxios
      .onGet(`http://localhost:8108/aliases/pages_v1`, undefined, {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
      })
      .reply(404, JSON.stringify({ message: "Not Found" }), {
        "content-type": "application/json; charset=utf-8",
      })

    mockAxios
      .onPut("http://localhost:8108/aliases/pages_v1", undefined, {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
      })
      .reply(201, "{}", { "content-type": "application/json; charset=utf-8" })
  })

  test("onPostBuild", async () => {
    // We're essentially checking if the expected API calls have been mocked
    // If a mock is missing, an error will be raised and the test will fail
    const pluginOptions = {
      publicDir: `${__dirname}/support/testground/public`,
      collectionSchema: COLLECTION_SCHEMA,
      server: SERVER_CONFIG,
    }

    await gatsbyNode.onPostBuild({ reporter: REPORTER }, pluginOptions)
  })
})
