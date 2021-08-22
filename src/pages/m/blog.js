import React, { useState, useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../../components/MLayout'
import Pagination from '../../components/Pagination'

import { mPageBody, mBlogList } from '../../styles/blogs.module.css'
import {
  sectionTitle,
  trendArticle,
  articleCover,
  articleInfo,
  articleTitle,
  articleBrief,
  articleFt,
  articleTime,
  articleTag,
} from '../../styles/mBlogs.module.css'

import { fixDeviceView } from '../../utils/tool'

function MBlogPage({ data }) {
  const { allMdx, site } = data
  const [curPage, setCurPage] = useState(1)
  const [list, setList] = useState(
    allMdx && allMdx.edges ? allMdx.edges.slice(0, 10) : []
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
      <div className={sectionTitle}>博客列表</div>

      <main className={mPageBody}>
        <ul className={mBlogList}>
          {list.map(({ node }) => {
            const { frontmatter } = node
            const tags = frontmatter.tag.split(',')

            return (
              <li key={node.id}>
                <article className={trendArticle}>
                  <Link to={frontmatter.slug}>
                    <div className={articleInfo}>
                      <h3 className={articleTitle}>{frontmatter.title}</h3>
                      <p className={articleBrief}>{frontmatter.brief}</p>
                      {frontmatter.cover && (
                        <div className={articleCover}>
                          <img
                            src={`/images/${frontmatter.cover}`}
                            alt="cover"
                          />
                        </div>
                      )}
                      <div className={articleFt}>
                        {tags.length > 0 && (
                          <div className={articleTag}>
                            {tags.map(item => {
                              return <span key={item}>{item}</span>
                            })}
                          </div>
                        )}
                        <div className={articleTime}>
                          发布于 {node.frontmatter.date}
                        </div>
                      </div>
                    </div>
                  </Link>
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

export default MBlogPage

export const query = graphql`
  query BLOG_M_QUERY {
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      edges {
        node {
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD HH:mm")
            slug
            brief
            tag
            cover
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
