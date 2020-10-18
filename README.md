# gatsby-plugin-typesense

## Description

Plugin to build typo-tolerant Instant Search experiences on [Gatsby](https://www.gatsbyjs.com/)-powered sites using [Typesense](http://typesense.org/). 

This plugin runs post-build and indexes the content you specify to Typesense. The search UI is then built with the [Typesense-InstantSearch.js](https://github.com/typesense/typesense-instantsearch-adapter) library.

Get a quick overview of Typesense in [this guide](https://typesense.org/guide/).

## How to install

```bash
npm install gatsby-plugin-typesense
```

Also install peer dependencies:

```bash
npm install @babel/runtime
```

## How it works

On post build, this plugin scans Gatsby's public directory looking for HTML files. Within each HTML file, it looks for HTML elements that have a data attribute called `data-typesense-field` and creates a Typesense `Document` with the value of that data attribute as the key, and the text content of that HTML element as the value. 

Here's an example: if you have the following HTML snippet in a file:

```html
<!-- ./public/about/index.html -->

...

<h1 data-typesense-field="title">About Us</h1>
<p data-typesense-field="description">
  Hello, we are Stark Industries.
</p>

...

```

When you build your site, this plugin will index this page as the following structured document in Typesense:

```json
{
  "title": "About Us",
  "description": "Hello, we are Stark Industries.",
  "page_path": "/about/",
  "page_priority_score": 10
}
```

You'll then be able to query this collection of documents (pages) from Typesense, via your [Search UI components](https://github.com/typesense/typesense-instantsearch-adapter).

You can also add any arbitrary fields to the document, by adding the `data-typesense-field` data attribute to any HTML element.

## How to use

### Step 1: Configure the plugin

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
              name: "page_path", // Required
              type: "string",
            },
            {
              name: "page_priority_score", // Required
              type: "int32",
            },
          ],
          default_sorting_field: "page_priority_score",  // Required
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

Here's what the options mean:

##### `publicDir`

The directory that the plugin will scan for HTML files to index. 

This is the directory where Gatsby usually places your build files when you run `gatsby build`. This is almost always `./public` relative to your repo root, unless you've changed it.

##### `collectionSchema`

The schema that will be used to create the collection in Typesense. 

A quick recap of Typesense terminology, if you haven't already read [the guide](https://typesense.org/guide/): A `Collection` contains many `Documents`. You create a `Collection` with a specific schema and then all `Documents` that are added to that `Collection` will be validated against that schema. You issue search queries against a `Collection` of `Documents`.

While the schema in the example above is a great starting point, you can choose to customize the schema to your needs. For eg: when you need to index more structured data from your pages like price, category, tags, etc you can add these as fields to the schema and add the corresponding `data-typesense-field` to your markup. You'll find the list of data types supported [here](https://typesense.org/docs/0.15.0/api/#create-collection).

⚠️ This plugin expects these two fields to be present in the schema:

- `page_path` - this is automatically set by the plugin based on the directory structure of `publicDir`
- `page_priority_score` - this is set to `10` by default for all pages, but you can override this value for any page like this: `<div data-typesense-field="page_priority_score" style="display: none;">5</div>`

##### `server`
Configuration details of your Typesense Cluster. 

This config object is passed straight to the [typesense-js](https://github.com/typesense/typesense-js) client. So any option you'd use to configure the JS client can be used here.

### Step 2: Markup your content

Add a data attribute in this format to any HTML elements that contain the data you want to be indexed for that page:

```html
<... data-typesense-field="field_name_defined_in_schema">Content to be indexed</...>
```

When the plugin runs, it looks for this data attribute and will add a field with the following format to the document:

```json
{
  ...,
  "field_name_defined_in_schema": "Content to be indexed"
  ...,
}
```

### Step 3: Build your site

This plugin runs automatically post-build. So you want to run:

```bash
gatsby build
```

This will index your content to Typesense.

## How to build a Search UI

The good folks over at Algolia have built and open-sourced [Instantsearch.js](https://github.com/algolia/instantsearch.js) which is a powerful collection of out-of-the-box components that you can use to compose interactive search experiences quickly.

Typesense has an integration with InstantSearch.js (and its [React](https://github.com/algolia/react-instantsearch), [Vue](https://github.com/algolia/vue-instantsearch) and [Angular](https://github.com/algolia/angular-instantsearch) cousins), that lets you use a Typesense Server with InstantSearch.js. Read more on how to use the adapter [here](https://github.com/typesense/typesense-instantsearch-adapter).

If you haven't used Instantsearch before, we recommend going through their Getting Started guide [here](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/#build-a-simple-ui). 

Once you go through the guide, follow the instructions in the Typesense Adapter repo [here](https://github.com/typesense/typesense-instantsearch-adapter#quick-start) to use Typesense with InstantSearch. 

## Local Development Workflow

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

## How to contribute

If you find any issues, have questions or have a feature suggestion please open an issue on Github: http://github.com/typesense/gatsby-plugin-typesense/issues

---
&copy; 2016-2020 Typesense Inc.
