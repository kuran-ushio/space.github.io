import React from 'react'

function Pagination({ pageCount, curPage, onPageChange }) {
  const handlePrev = () => {
    onPageChange(curPage - 1)
  }
  const handleNext = () => {
    onPageChange(curPage + 1)
  }

  return (
    <div className="pager">
      {curPage > 1 && (
        <button
          aria-label="previous page"
          className="pager-btn pager-prev"
          onClick={handlePrev}
        >
          上一页
        </button>
      )}
      <span>
        {curPage} / {pageCount}
      </span>
      {curPage < pageCount && (
        <button
          aria-label="next page"
          className="pager-btn pager-next"
          onClick={handleNext}
        >
          下一页
        </button>
      )}
    </div>
  )
}

export default Pagination
