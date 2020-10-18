import React from "react"
import Header from "../components/header"
import Footer from "../components/footer"

export default function About() {
  return (
    <div>
      <Header pageName="About" />
      <div data-typesense-field={"description"}>
        This is some about us content
      </div>
      <div>
        <span data-typesense-field={"tags"}>about</span>
        <span data-typesense-field={"tags"}>misc</span>
      </div>
      <Footer />
    </div>
  )
}
