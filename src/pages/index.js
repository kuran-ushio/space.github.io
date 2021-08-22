import React, { useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Profile from '../components/Profile'

import { fixDeviceView } from '../utils/tool'

import {
  trendList,
  trendItem,
  trendArticle,
  articleTitle,
  articleBrief,
  articleFt,
  articleTime,
  articleTag,
  articleWorks,
  worksImg,
  worksTag,
  trendItemCircle,
} from '../styles/trend.module.css'

const COLORS = [
  '#f64f59',
  '#f79d00',
  '#ffd452',
  '#67B26F',
  '#64f38c',
  '#12c2e9',
  '#c471ed',
]

function IndexPage({ data }) {
  const { site, allMdx, allWorks } = data

  const markdowns = allMdx.edges.map(item => {
    const tmp = JSON.parse(JSON.stringify(item))
    tmp.node.dataType = 'md'
    return { ...tmp }
  })
  const works = allWorks.edges.map(item => {
    const tmp = JSON.parse(JSON.stringify(item))
    tmp.node.dataType = 'json'
    return { ...tmp }
  })

  const trends = markdowns
    .concat(works)
    .slice(0, 7)
    .sort(
      (a, b) =>
        new Date(b.node.frontmatter.date) - new Date(a.node.frontmatter.date)
    )

  useEffect(() => {
    fixDeviceView()
  }, [])

  const renderMd = frontmatter => {
    const tags = frontmatter.tag.split(',')

    return (
      <article className={trendArticle}>
        <div className={articleTitle}>
          <span>发布了笔记《 </span>
          <Link to={frontmatter.slug} className={articleTitle}>
            {frontmatter.title}
          </Link>
          <span> 》</span>
        </div>
        <p className={articleBrief}>{frontmatter.brief}</p>
        <div className={articleFt}>
          {tags.length > 0 && (
            <div className={articleTag}>
              {tags.map(item => {
                return <span key={item} className={`icon-${item}`}></span>
              })}
            </div>
          )}
          <div className={articleTime}>{frontmatter.date}</div>
        </div>
      </article>
    )
  }

  const renderWorks = frontmatter => {
    const imgs = frontmatter.images.split(',')
    const tags = frontmatter.techs.split(',')

    return (
      <article className={trendArticle}>
        <p className={articleTitle}>
          <span>添加了练习《 </span>
          <Link to={frontmatter.slug}>{frontmatter.title}</Link>
          <span> 》</span>
        </p>

        {imgs.length > 0 && (
          <div className={articleWorks}>
            {imgs.map(item => {
              return (
                <div className={worksImg} key={item}>
                  <img src={`/images/${item}`} alt="works" />
                </div>
              )
            })}
          </div>
        )}

        <div className={articleFt} style={{ marginTop: 10 }}>
          {tags.length > 0 && (
            <div className={worksTag}>
              {tags.map(item => {
                return <span key={item}>{item}</span>
              })}
            </div>
          )}
          <div className={articleTime}>{frontmatter.date}</div>
        </div>
      </article>
    )
  }

  return (
    <Layout pageTitle="Home" siteTitle={site.siteMetadata.title}>
      <main className="main">
        <div>
          <Profile />
        </div>

        <div className="main-rgt">
          <div className="main-title">动态</div>

          <div>
            <ul className={trendList}>
              {trends.map(({ node }, index) => {
                const { frontmatter } = node

                return (
                  <li className={trendItem} key={node.id}>
                    <i
                      className={trendItemCircle}
                      style={{ borderColor: COLORS[index] }}
                    ></i>
                    {node.dataType === 'md'
                      ? renderMd(frontmatter)
                      : renderWorks(frontmatter)}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query HOME_PAGE_QUERY {
    site {
      siteMetadata {
        title
      }
    }

    allMdx(sort: { fields: frontmatter___date, order: DESC }, limit: 7) {
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
    }

    allWorks(sort: { fields: frontmatter___date, order: DESC }, limit: 7) {
      edges {
        node {
          frontmatter {
            title
            date
            images
            techs
            slug
          }
          id
        }
      }
    }
  }
`
