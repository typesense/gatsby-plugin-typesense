/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typesense`,
      options: {
        publicDir: `${__dirname}/public`, // Required
        collectionSchema: {
          // Required
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
              name: "page_path", // Required
              type: "string",
            },
            {
              name: "page_priority_score", // Required
              type: "int32",
            },
          ],
          default_sorting_field: "page_priority_score", // Required
        },
        server: {
          // Required
          apiKey: "xyz",
          nodes: [
            {
              host: "localhost",
              port: "8108",
              protocol: "http",
            },
          ],
        },
      },
    },
  ],
}
