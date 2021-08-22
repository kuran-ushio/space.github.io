import React, { useState } from 'react'
import { graphql } from 'gatsby'
import TopNav from '../components/TopNav'
import MHeader from '../components/MHeader'
import PageFoot from '../components/PageFoot'
import {
  mainWorks,
  worksContainer,
  worksTitle,
  worksDesc,
  worksTags,
  worksImgs,
} from '../styles/work.module.css'

import { checkMobileDevice } from '../utils/tool'

function WorksDetail({ data }) {
  const [maskVisible, setMaskVisible] = useState(false)
  const [maskPic, setMaskPic] = useState('')
  const { works } = data
  const { frontmatter } = works

  const images = frontmatter.images.split(',')
  const isMobile = checkMobileDevice()

  const handleEnlargeImg = pic => {
    if (isMobile) return

    setMaskPic(pic)
    setMaskVisible(true)
  }

  const handleCloseMask = e => {
    if (isMobile) return

    if (e.target.nodeName !== 'IMG') {
      setMaskVisible(false)
    }
  }

  return (
    <div className="page">
      <title>Blog - My Space</title>

      {isMobile ? <MHeader /> : <TopNav />}

      <main className={mainWorks}>
        <div className={worksContainer}>
          <h3 className={worksTitle}>{frontmatter.title}</h3>
          <div className={worksDesc}>{frontmatter.desc}</div>
          <div className={worksTags}>
            标签: {frontmatter.techs.replace(/,/g, ', ')}
          </div>
          <div className={worksImgs}>
            <ul>
              {images.map(item => {
                return (
                  <li key={item} onClick={handleEnlargeImg.bind(this, item)}>
                    <img src={`/images/${item}`} alt="works" />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* 图片放大查看 */}
        <div
          className={'mask' + (maskVisible ? '' : ' mask-hidden')}
          onClick={handleCloseMask}
          role="dialog"
        >
          <div className="pic-container">
            <div className="pic-border">
              <div className="close">
                <svg
                  t="1588043317665"
                  className="icon"
                  viewBox="0 0 1027 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1447"
                  width="24"
                  height="24"
                >
                  <path
                    d="M926.04967852 879.09971899l-366.57303359-366.57303359 366.5730336-366.5730336c12.64044946-12.64044946 12.64044946-33.70786523 0-46.3483147s-33.70786523-12.64044946-46.3483147 0l-366.5730336 366.5730336-366.5730336-366.5730336c-12.64044946-12.64044946-33.70786523-12.64044946-46.3483147 0-12.64044946 12.64044946-12.64044946 33.70786523 0 46.3483147l366.5730336 366.5730336-366.5730336 366.57303359c-8.42696631 8.42696631-12.64044946 21.06741578-8.4269663 33.70786524 4.21348315 12.64044946 16.85393261 21.06741578 29.49438208 21.06741577 8.42696631 0 16.85393261-4.21348315 21.06741576-8.42696631l366.5730336-366.5730336 366.57303361 366.5730336c4.21348315 4.21348315 12.64044946 8.42696631 21.06741578 8.42696631 12.64044946 0 25.28089893-8.42696631 29.49438207-21.06741577 8.42696631-12.64044946 8.42696631-25.28089893 0-33.70786524z"
                    p-id="1448"
                    fill="#ee9ca7"
                  />
                </svg>
              </div>
              <div className="corner corner-lt"></div>
              <div className="corner corner-tl"></div>
              <div className="corner corner-rb"></div>
              <div className="corner corner-br"></div>
              <div className="pic">
                <img src={`/images/${maskPic}`} alt="img" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isMobile && <PageFoot />}
    </div>
  )
}

export const query = graphql`
  query WORKS_DATA_QUERY ($slug: String!) {
    works(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        date
        desc
        images
        side
        slug
        techs
        title
      }
    }
  }
`

export default WorksDetail
