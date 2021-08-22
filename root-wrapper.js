import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import Code from './src/components/Code'

const components = {
  h2: ({ children }) => <h2>{children}</h2>,
  'p.inlineCode': props => (
    <code {...props} />
  ),
  pre: ({ children: { props } }) => {
    if (props.mdxType === 'code') {
      return (
        <Code
          codeString={props.children.trim()}
          language={props.className && props.className.replace('language-', '')}
          {...props}
        />
      )
    }
  },
}

export const wrapRootElement = ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
)
