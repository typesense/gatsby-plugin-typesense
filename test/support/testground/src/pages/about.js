import React from "react"
import Header from "../components/header"
import Footer from "../components/footer"

export default function About() {
  return (
    <div>
      <Header pageName="About" />
      {/* An example of a string field */}
      <div data-typesense-field={"description"}>
        This is some about us content
      </div>
      {/* An example of a float field */}
      <div data-typesense-field={"price"}>9.99</div>
      {/* An example of an int32 field */}
      <div data-typesense-field={"stock"}>4</div>
      {/* An example of a bool field */}
      <div data-typesense-field={"published"}>true</div>
      <div>
        {/* An example of an string[] field */}
        <span data-typesense-field={"tags"}>about</span>
        <span data-typesense-field={"tags"}>misc</span>
      </div>
      <div>
        {/* An example of an int32[] field */}
        <span data-typesense-field={"score"}>3</span>
        <span data-typesense-field={"score"}>5</span>
      </div>
      <Footer />
    </div>
  )
}
