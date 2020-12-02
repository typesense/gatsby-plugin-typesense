const axios = require("axios")
const MockAxiosAdapter = require("axios-mock-adapter")

describe("gatsby-node.js", () => {
  let gatsbyNode
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
        name: "stock",
        type: "int32",
        optional: true,
      },
      {
        name: "published",
        type: "bool",
        optional: true,
      },
      {
        name: "score",
        type: "int32[]",
        optional: true,
      },
      {
        name: "price",
        type: "float",
        optional: true,
      },
      {
        name: "tags",
        type: "string[]",
        optional: true,
        facet: true,
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
    logLevel: "debug", // Useful to know the last request that was made, especially when a mock is missing
  }

  const NEW_COLLECTION_NAME = `pages_v1_${Date.now()}`

  const REPORTER = {
    info: jest.fn(msg => console.info(msg)),
    verbose: jest.fn(msg => console.log(msg)),
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
    gatsbyNode = require("../gatsby-node")
    mockAxios = new MockAxiosAdapter(axios)
  })

  test("onPostBuild", async () => {
    mockAxios
      .onPost("http://localhost:8108/collections", undefined, {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-TYPESENSE-API-KEY": SERVER_CONFIG.apiKey,
      })
      .reply(config => {
        // console.log(config)
        expect(JSON.parse(config.data).fields).toEqual(COLLECTION_SCHEMA.fields)
        return [201, "{}", { "content-type": "application/json" }]
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
          stock: 4,
          price: 9.99,
          published: true,
          tags: ["about", "misc"],
          score: [3, 5],
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
      .reply(config => {
        // console.log(config)
        expect(JSON.parse(config.data).collection_name).toEqual(
          NEW_COLLECTION_NAME
        )
        return [201, "{}", { "content-type": "application/json" }]
      })

    const pluginOptions = {
      publicDir: `${__dirname}/support/testground/public`,
      collectionSchema: COLLECTION_SCHEMA,
      server: SERVER_CONFIG,
      generateNewCollectionName: jest.fn(() => NEW_COLLECTION_NAME),
    }

    await gatsbyNode.onPostBuild({ reporter: REPORTER }, pluginOptions)
  })
})
