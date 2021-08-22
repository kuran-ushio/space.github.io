import React from 'react'
import MHeader from './MHeader'

function Layout({ pageTitle, siteTitle, children }) {
  return (
    <div className="page">
      <title>
        {pageTitle} - {siteTitle}
      </title>

      <MHeader />

      {children}
    </div>
  )
}

export default Layout
