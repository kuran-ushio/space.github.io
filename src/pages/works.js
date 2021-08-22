import React, { useState, useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import {
  pageBody,
  worksList,
  worksItem,
  worksCover,
  worksInfo,
  worksTitle,
  worksTime,
} from '../styles/works.module.css'

import { CLIENT_TYPES } from '../utils/const'
import { fixDeviceView } from '../utils/tool'

function Works({ data }) {
  const { allWorks, site } = data
  const [curPage, setCurPage] = useState(1)
  const [list, setList] = useState(
    allWorks.edges ? allWorks.edges.slice(0, 10) : []
  )

  const pageCount = Math.ceil(allWorks.totalCount / 10)

  const onPageChange = page => {
    setList(allWorks.edges.slice((page - 1) * 10, page * 10))
    setCurPage(page)
  }

  useEffect(() => {
    fixDeviceView()
  }, [])

  return (
    <Layout pageTitle="Works" siteTitle={site.siteMetadata.title}>
      <main className={pageBody}>
        <ul className={worksList}>
          {list.map(({ node }) => {
            const { frontmatter } = node

            return (
              <li className={worksItem} key={node.id}>
                <Link to={frontmatter.slug}>
                  <div className={worksCover}>
                    <img
                      src={`/images/${frontmatter.images.split(',')[0]}`}
                      alt="works"
                    />
                  </div>
                  <div>
                    <div className={worksTitle}>{frontmatter.title}</div>
                    <div className={worksInfo}>
                      <span
                        className={`icon-client icon-${
                          CLIENT_TYPES[frontmatter.side - 1].icon
                        }`}
                      ></span>
                      <span className={worksTime}>{frontmatter.date}</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <Pagination
          pageCount={pageCount}
          curPage={curPage}
          onPageChange={onPageChange}
        />
      </main>
    </Layout>
  )
}

export default Works

export const query = graphql`
  query WORKS_PAGE_QUERY {
    site {
      siteMetadata {
        title
      }
    }

    allWorks(sort: { fields: frontmatter___date, order: DESC }) {
      edges {
        node {
          frontmatter {
            date
            images
            side
            slug
            title
          }
          id
        }
      }
      totalCount
    }
  }
`
