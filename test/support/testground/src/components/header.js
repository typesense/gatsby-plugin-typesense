import React from "react"

export default function Header(props) {
  return (
    <div>
      <h1 data-typesense-field={"title"}>{props.pageName}</h1>
    </div>
  )
}
