import React, { useState, useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../../components/MLayout'
import Pagination from '../../components/Pagination'

import { mPageBody, mWorksList } from '../../styles/works.module.css'
import {
  sectionTitle,
  mWorksItem,
  mWorksCover,
  mWorksInfo,
  mWorksTitle,
  mWorksTime,
} from '../../styles/mWorks.module.css'

import { CLIENT_TYPES } from '../../utils/const'
import { fixDeviceView } from '../../utils/tool'

function Works({ data }) {
  const { allWorks, site } = data
  const [curPage, setCurPage] = useState(1)
  const [list, setList] = useState(
    allWorks && allWorks.edges ? allWorks.edges.slice(0, 10) : []
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
    <Layout pageTitle="Blog" siteTitle={site.siteMetadata.title}>
      <div className={sectionTitle}>练习合集</div>

      <main className={mPageBody}>
        <ul className={mWorksList}>
          {list.map(({ node }) => {
            const { frontmatter } = node

            return (
              <li className={mWorksItem} key={node.id}>
                <Link to={frontmatter.slug}>
                  <div className={mWorksCover}>
                    <img
                      src={`/images/${frontmatter.images.split(',')[0]}`}
                      alt="works"
                    />
                  </div>
                  <div>
                    <div className={mWorksTitle}>{frontmatter.title}</div>
                    <div className={mWorksInfo}>
                      <span
                        className={`icon-client icon-${
                          CLIENT_TYPES[frontmatter.side - 1].icon
                        }`}
                      ></span>
                      <span className={mWorksTime}>{frontmatter.date}</span>
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
  query WORKS_M_QUERY {
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

    site {
      siteMetadata {
        title
      }
    }
  }
`
