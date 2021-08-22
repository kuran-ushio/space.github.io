import React, { useState, useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'

import {
  trendArticle,
  articleTitle,
  articleBrief,
  articleFt,
  articleTime,
  articleTag,
} from '../styles/trend.module.css'
import { pageBody, blogList } from '../styles/blogs.module.css'

import { fixDeviceView } from '../utils/tool'

function Blog({ data }) {
  const { allMdx, site } = data

  const [curPage, setCurPage] = useState(1)
  const [list, setList] = useState(
    allMdx.edges ? allMdx.edges.slice(0, 10) : []
  )

  const pageCount = Math.ceil(allMdx.totalCount / 10)

  const onPageChange = page => {
    setList(allMdx.edges.slice((page - 1) * 10, page * 10))
    setCurPage(page)
  }

  useEffect(() => {
    fixDeviceView()
  }, [])

  return (
    <Layout pageTitle="Blog" siteTitle={site.siteMetadata.title}>
      <main className={pageBody}>
        <ul className={blogList}>
          {list.map(({ node }) => {
            const { frontmatter } = node
            const tags = frontmatter.tag.split(',')

            return (
              <li key={node.id}>
                <article className={trendArticle}>
                  <h3 className={articleTitle}>
                    <Link to={frontmatter.slug}>{frontmatter.title}</Link>
                  </h3>
                  <p className={articleBrief}>{frontmatter.brief}</p>
                  <div className={articleFt}>
                    {tags.length > 0 && (
                      <div className={articleTag}>
                        {tags.map(item => {
                          return (
                            <span key={item} className={`icon-${item}`}></span>
                          )
                        })}
                      </div>
                    )}
                    <div className={articleTime}>
                      发布于 {node.frontmatter.date}
                    </div>
                  </div>
                </article>
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

export default Blog

export const query = graphql`
  query BLOG_PAGE_QUERY {
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      edges {
        node {
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD HH:mm")
            slug
            brief
            tag
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
