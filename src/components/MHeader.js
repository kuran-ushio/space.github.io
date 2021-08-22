import React, { useState } from 'react'
import { Link } from 'gatsby'
import avatarImg from '../assets/avatar.jpeg'
import {
  header,
  headerBar,
  icon,
  topInfo,
  topClose,
  topMenu,
  closeOff,
  closeActive,
  divider,
} from '../styles/mHeader.module.css'

const navs = [
  {
    key: 'Home',
    title: '首页',
    to: '/',
  },
  {
    key: 'Blog',
    title: '笔记',
    to: '/m/blog',
  },
  {
    key: 'Works',
    title: '练习',
    to: '/m/works',
  },
]

function MHeader() {
  const [showMenu, setShowMenu] = useState(false)

  const handleToggleMenu = () => {
    setShowMenu(!showMenu)
  }

  return (
    <header className={header}>
      <div className={headerBar}>
        <div className={icon}>
          <img src={avatarImg} alt="avatar" />
        </div>
        <div className={topInfo}>
          <div>Ushio</div>
          <span>
            To reveal all mysteries and doubts, have the lust for life.
          </span>
        </div>
        <div className={topClose} onClick={handleToggleMenu} role="button">
          <div className={showMenu ? closeActive : closeOff}></div>
        </div>
        {showMenu && (
          <div className={topMenu}>
            <ul>
              {navs.map(item => {
                return (
                  <li key={item.key}>
                    <Link to={item.to}>{item.title}</Link>
                    <div className={divider}></div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

export default MHeader
