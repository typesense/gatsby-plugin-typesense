import React from "react"
import { Link } from "gatsby"

export default function Footer(props) {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <br />
        <Link to="/about/">About</Link>
      </nav>
    </div>
  )
}
