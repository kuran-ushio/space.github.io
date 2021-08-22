const { works } = require('./src/utils/const')

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  works.forEach(item => {
    const node = {
      frontmatter: {
        slug: `/works/${item.slug}`,
        name: item.name,
        title: item.title,
        techs: item.techs,
        desc: item.desc,
        side: item.side,
        date: item.date,
        images: item.images,
      },
      id: createNodeId(`Works-${item.slug}`),
      internal: {
        type: 'Works',
        contentDigest: createContentDigest(item),
      },
    }
    actions.createNode(node)
  })
}

exports.createPages = async function ({ actions, graphql }) {
  const { createPage } = actions
  const blogDetailTml = require.resolve('./src/templates/blog-detail.js')
  const worksDetailTml = require.resolve('./src/templates/works-detail.js')

  const res = await graphql(`
    {
      allMdx(sort: { fields: frontmatter___date, order: DESC }) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
          next {
            frontmatter {
              slug
            }
          }
          previous {
            frontmatter {
              slug
            }
          }
        }
      }

      allWorks(sort: { fields: frontmatter___date, order: DESC }) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
          next {
            frontmatter {
              slug
            }
          }
          previous {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `)

  if (res.errors) {
    return Promise.reject(res.errors)
  }

  res.data.allMdx.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: node.frontmatter.slug,
      component: blogDetailTml,
      context: {
        slug: node.frontmatter.slug,
        next: next ? next.frontmatter.slug : null,
        previous: previous ? previous.frontmatter.slug : null,
      },
    })
  })

  res.data.allWorks.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: node.frontmatter.slug,
      component: worksDetailTml,
      context: {
        slug: node.frontmatter.slug,
        next: next ? next.frontmatter.slug : null,
        previous: previous ? previous.frontmatter.slug : null,
      },
    })
  })

  return Promise.resolve('ok')
}
