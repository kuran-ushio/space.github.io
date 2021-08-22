import React from 'react'
import { graphql, Link } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import TopNav from '../components/TopNav'
import MHeader from '../components/MHeader'
import PageFoot from '../components/PageFoot'
import avatarImg from '../assets/avatar.jpeg'
import 'github-markdown-css/github-markdown.css'
import {
  mainBlog,
  blogContainer,
  blogTitle,
  baseInfo,
  blogTime,
  author,
  avatar,
  pager,
  pagerPrev,
  pagerNext,
} from '../styles/blog.module.css'

import { checkMobileDevice } from '../utils/tool'

function BlogDetail({ data, pageContext }) {
  const { frontmatter, body } = data.mdx

  const isMobile = checkMobileDevice()

  return (
    <div className="page">
      <title>Blog - My Space</title>

      {isMobile ? <MHeader /> : <TopNav />}

      <main className={mainBlog}>
        <div className={blogContainer}>
          <h2 className={blogTitle}>{frontmatter.title}</h2>
          <div className={baseInfo}>
            <div className={author}>
              <div className={avatar}>
                <img src={avatarImg} alt="avatar" />
              </div>
              <span>Ushio</span>
            </div>
            <div className={blogTime}>发布于 {frontmatter.date}</div>
          </div>

          <div className="markdown-body">
            <MDXRenderer>{body}</MDXRenderer>
          </div>

          <div className={pager}>
            {pageContext.previous && (
              <div className={pagerPrev} title="上一篇">
                <Link to={pageContext.previous}>上一篇</Link>
                {isMobile && <span>上一篇</span>}
              </div>
            )}
            {pageContext.next && (
              <div className={pagerNext} title="下一篇">
                {isMobile && <span>下一篇</span>}
                <Link to={pageContext.next}>下一篇</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {!isMobile && <PageFoot />}
    </div>
  )
}

export const query = graphql`
  query BLOG_DATA_QUERY ($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      frontmatter {
        date
        title
        slug
      }
    }
  }
`

export default BlogDetail
