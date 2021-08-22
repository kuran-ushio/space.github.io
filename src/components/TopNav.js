import React from 'react'
import { Link } from 'gatsby'
import { topNav, navBar, titleEn, liActive } from '../styles/topnav.module.css'

const navs = [
  {
    key: 'Home',
    title: '首页',
    to: '/',
  },
  {
    key: 'Blog',
    title: '笔记',
    to: '/blog',
  },
  {
    key: 'Works',
    title: '练习',
    to: '/works',
  },
]

function TopNav(props) {
  return (
    <header className={topNav}>
      <div className="linear-bg"></div>
      <div className={navBar}>
        <ul>
          {navs.map(nav => {
            return (
              <li
                key={nav.key}
                className={props.active === nav.key ? liActive : null}
              >
                <Link to={nav.to}>
                  {nav.title}<span className={titleEn}> / {nav.key}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </header>
  )
}

export default TopNav
