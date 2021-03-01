# gatsby-plugin-typesense [![NPM version][npm-image]][npm-url] [![CircleCI](https://circleci.com/gh/typesense/gatsby-plugin-typesense.svg?style=shield)](https://circleci.com/gh/typesense/gatsby-plugin-typesense)

A Gatsby plugin to build typo-tolerant Instant Search experiences on [Gatsby](https://www.gatsbyjs.com/)-powered sites using [Typesense](http://typesense.org/). 

This plugin runs post-build and indexes content from your site to Typesense. The search UI is then built with the [Typesense-InstantSearch.js](https://github.com/typesense/typesense-instantsearch-adapter) library.

This plugin works for both static and dynamic Gatsby sites. It does not depend on you using Markdown, Frontmatter, or any particular Gatsby plugin. It does not even depend on React. So you can use it with really any type of Gatsby site. 

#### What is Typesense? 

If you're new to Typesense, it is an **open source** search engine that is simple to use, run and scale, with clean APIs and documentation. Think of it as an open source alternative to Algolia and an easier-to-use, batteries-included alternative to ElasticSearch. Get a quick overview from [this guide](https://typesense.org/guide/).

## ✨ How it works

On post build, this plugin scans Gatsby's public directory looking for HTML files. Within each HTML file, it looks for HTML elements that have a data attribute called `data-typesense-field` and creates a Typesense `Document` with the value of that data attribute as the key, and the text content of that HTML element as the value. 

Here's an example: if you have the following HTML snippet in a file:

```html
<!-- ./public/about/index.html -->

...

<h1 data-typesense-field="title">About Us</h1>
<p data-typesense-field="description">
  Hello, we are Stark Industries.
</p>
<div>
  <span data-typesense-field="tags">about</span>
  <span data-typesense-field="tags">misc</span>
</div>

...

```

When you build your site, this plugin will index this page as the following structured document in Typesense:

```json
{
  "title": "About Us",
  "description": "Hello, we are Stark Industries.",
  "tags": ["about", "misc"],
  "page_path": "/about/",
  "page_priority_score": 10
}
```

You'll then be able to query this collection of documents (pages) from Typesense, via your Search UI components from [Typesense-InstantSearch.js](https://github.com/typesense/typesense-instantsearch-adapter).

You can also add any arbitrary fields to the document, by adding the `data-typesense-field` data attribute to any HTML element.

## ⌨️ How to install

```bash
npm install gatsby-plugin-typesense
```

Also install peer dependencies:

```bash
npm install @babel/runtime
```

## 🛠️ How to use

### 1️⃣ Start a Typesense server

The simplest way to run a Typesense server is using Docker:

```
mkdir /tmp/typesense-server-data
docker run -i -p 8108:8108 -v/tmp/typesense-server-data/:/data typesense/typesense:0.19.0 --data-dir /data --api-key=xyz --listen-port 8108 --enable-cors
```

You can also download native binaries [here](https://typesense.org/downloads/).

If you'd prefer a hosted version of Typesense, you can also spin up a cluster on [Typesense Cloud](https://cloud.typesense.org/). 

### 2️⃣ Configure the plugin

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typesense`,
      options: {
        publicDir: `${__dirname}/public`, // Required
        collectionSchema: { // Required
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
        server: { // Required
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
```

#### Here's what the options mean:

##### `publicDir`

The directory that the plugin will scan for HTML files to index. 

This is the directory where Gatsby usually places your build files when you run `gatsby build`. This is almost always `./public` relative to your repo root, unless you've changed it.

##### `collectionSchema`

The schema that will be used to create the collection in Typesense. 

A quick recap of Typesense terminology, if you haven't already read [the guide](https://typesense.org/guide/): A `Collection` contains many `Documents`. You create a `Collection` with a specific schema and then all `Documents` that are added to that `Collection` will be validated against that schema. You issue search queries against a `Collection` of `Documents`.

While the schema in the example above is a great starting point, you can choose to customize the schema to your needs. For eg: when you need to index more structured data from your pages like price, category, tags, etc you can add these as fields to the schema and add the corresponding `data-typesense-field` to your markup. You'll find the list of data types supported [here](https://typesense.org/docs/0.16.0/api/#create-collection).

⚠️ This plugin expects these two fields to be present in the schema:

- `page_path` - this is automatically set by the plugin based on the directory structure of `publicDir`
- `page_priority_score` - this is set to `10` by default for all pages, but you can override this value for any page like this: `<div data-typesense-field="page_priority_score" style="display: none;">5</div>`

##### `server`
Configuration details of your Typesense Cluster. 

This config object is passed straight to the [typesense-js](https://github.com/typesense/typesense-js) client. So any option you'd use to configure the JS client can be used here.

#### Adding more than one collection

To add more than one collection to Typesense (for example, if you have two search UIs, one for blog posts and another for authors... or if you have multilingual site and wish to separate the contents so that searching in one language would return only results from that collection), simply call `gatsby-plugin-typesense` multiple times:

```jsx
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typesense`,
      options: {
        publicDir: `${__dirname}/public/posts`,
        collectionSchema: {
          name: "posts",
          ...
        },
        server: { ... },
      },
    },
    {
      resolve: `gatsby-plugin-typesense`,
      options: {
        publicDir: `${__dirname}/public/authors`,
        collectionSchema: {
          name: "authors",
          ...
        },
        server: { ... },
      },
    },
    ...
  ]
  ...
}
```

Be sure to specify which collection you're querying from your search UI.

### 3️⃣ Markup your content

Add a data attribute in this format to any HTML elements that contain the data you want to be indexed for that page:

```html
<... data-typesense-field="field_name_defined_in_schema">Content to be indexed</...>
```

When the plugin runs, it looks for this data attribute and will add a field with the following format to the document:

```
{
  ...,
  "field_name_defined_in_schema": "Content to be indexed",
  ...,
}
```

If you have an array data type defined in the schema (useful when you need to index multiple sections on the same page to the same field), you can add the same `data-typesense-field="X"` attribute to multiple elements. 

For example: let's say you have a `string[]` field called `array_field_defined_in_schema` in your schema.

If you have the following in your markup:

```html
<p data-typesense-field="array_field_defined_in_schema">Para 1</p>
<p data-typesense-field="array_field_defined_in_schema">Para 2</p>
```

When the plugin runs, it looks for this data attribute and will add a field with the following format to the document:

```
{
  ...,
  "array_field_defined_in_schema": ["Para 1", "Para 2"],
  ...,
}
```

### 4️⃣ Build your site

This plugin runs automatically post-build. So you want to run:

```bash
gatsby build
```

This will index your content to your Typesense search cluster.

## 🔍 How to build a Search UI

The good folks over at Algolia have built and open-sourced [Instantsearch.js](https://github.com/algolia/instantsearch.js) which is a powerful collection of out-of-the-box UI components that you can use to compose interactive search experiences quickly.

Typesense has an integration with InstantSearch.js (and its [React cousin](https://github.com/algolia/react-instantsearch)), that lets you use a Typesense cluster with InstantSearch.js. 

Install InstantSearch and the Typesense Adapter in your Gatsby project:

```bash
npm install typesense-instantsearch-adapter react-instantsearch-dom @babel/runtime
```

Here's a quick minimal example of a search interface:

```jsx
import { InstantSearch, SearchBox, Hits, Stats } from "react-instantsearch-dom"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "xyz", // Be sure to use the search-only-api-key
    nodes: [
      {
        host: "localhost",
        port: "8108",
        protocol: "http",
      },
    ],
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  additionalSearchParameters: {
    queryBy: "title,description,tags",
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient

export default function SearchInterface() {
  const Hit = ({ hit }) => (
    <p>
      {hit.title} - {hit.description}
    </p>
  )

  return (
      <InstantSearch searchClient={searchClient} indexName="pages_v1">
        <SearchBox />
        <Stats />
        <Hits hitComponent={Hit} />
      </InstantSearch>
  )
}
```

InstantSearch.js supports a variety of additional [search widgets](https://www.algolia.com/doc/guides/building-search-ui/widgets/showcase/react/). Read more about how to use them in their documentation [here](https://www.algolia.com/doc/guides/building-search-ui/getting-started/react/).

Read more on how to use the Typesense adapter [here](https://github.com/typesense/typesense-instantsearch-adapter#quick-start).

## 🏗️ Local Development Workflow

This section **only** applies if you're developing the plugin itself. 

```bash

# Start a local typesense server (uses Docker)
npm run typesenseServer

# Build the gatsby project under ./test/support/testground, which will also trigger this plugin
npm run testground:build

```

### Running tests

```bash
npm test
```

### Releasing a new version

To release a new version, we use the np package:

```bash
npm install --global np
np 

# Follow instructions that np shows you
```

## 🤗 How to contribute

If you find any issues, have questions or have a feature suggestion please open an issue on Github: http://github.com/typesense/gatsby-plugin-typesense/issues

---
&copy; 2016-2020 Typesense Inc.

[npm-image]: https://badge.fury.io/js/gatsby-plugin-typesense.svg
[npm-url]: https://npmjs.org/package/gatsby-plugin-typesense
