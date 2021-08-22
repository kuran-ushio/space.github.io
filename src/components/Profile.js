import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import avatarImg from '../assets/avatar.jpeg'
import {
  profile,
  avatar,
  username,
  desc,
  statistic,
  statisticItem,
  statisticCount,
  statisticTitle,
  divider,
} from '../styles/profile.module.css'
import { formatMaxCount } from '../utils/tool'

function Profile() {
  const blogQuery = useStaticQuery(graphql`
    query STATISTIC_QUERY {
      allMdx {
        totalCount
      }
      allWorks {
        totalCount
      }
    }
  `)

  return (
    <section className={profile}>
      <div className={avatar}>
        <img src={avatarImg} alt="avatar" />
      </div>
      <div className={username}>Ushio</div>
      <div className={desc}>
        To reveal all mysteries and doubts,
        <br /> have the lust for life.
      </div>

      <div className={statistic}>
        <div className={statisticItem}>
          <span className={statisticCount}>
            {formatMaxCount(blogQuery.allMdx.totalCount)}
          </span>
          <span className={statisticTitle}>笔记</span>
        </div>
        <i className={divider}></i>
        <div className={statisticItem}>
          <span className={statisticCount}>
            {formatMaxCount(blogQuery.allWorks.totalCount)}
          </span>
          <span className={statisticTitle}>练习</span>
        </div>
      </div>
    </section>
  )
}

export default Profile
