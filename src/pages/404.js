import React from 'react'
import { page404, divider } from '../styles/404.module.css'

function Page404() {
  return (
    <div className={page404}>
      <span>404</span>
      <i className={divider}></i>
      <span>PAGE NOT FOUND</span>
    </div>
  )
}

export default Page404
