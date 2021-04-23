import React from "react"
import Header from "../components/header"
import Footer from "../components/footer"

export default function Excluded() {
  return (
    <div>
      <Header pageName="Excluded Page" />
      {/* An example of a string field */}
      <div data-typesense-field={"description"}>
        This page should be excluded
      </div>
      <Footer />
    </div>
  )
}
