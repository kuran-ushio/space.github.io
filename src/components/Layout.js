import React from 'react'
import TopNav from './TopNav'
import PageFoot from './PageFoot'

function Layout({ pageTitle, siteTitle, children }) {
  return (
    <div className="page">
      <title>
        {pageTitle} - {siteTitle}
      </title>

      <TopNav active={pageTitle} />

      {children}

      <PageFoot />
    </div>
  )
}

export default Layout
