import React from "react"
import { Link } from "gatsby"

export default function Footer() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about/">About</Link>
    </nav>
  )
}
