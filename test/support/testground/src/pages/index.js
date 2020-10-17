import React from "react"
import { InstantSearch, SearchBox, Hits, Stats } from "react-instantsearch-dom"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import Header from "../components/header"
import Footer from "../components/footer"

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
    queryBy: "title,description",
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient

export default function Home() {
  const Hit = ({ hit }) => (
    <p>
      {hit.title} - {hit.description}
    </p>
  )

  return (
    <div>
      <Header pageName="Home" />
      <div data-typesense-field={"description"}>
        This is some home page content
      </div>

      <InstantSearch searchClient={searchClient} indexName="pages_v1">
        <SearchBox />
        <Stats />
        <Hits hitComponent={Hit} />
      </InstantSearch>

      <Footer />
    </div>
  )
}
