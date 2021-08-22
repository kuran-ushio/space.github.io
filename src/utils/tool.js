exports.formatMaxCount = function (n) {
  return n > 999 ? '999+' : n + ''
}

exports.checkMobileDevice = function () {
  var sUserAgent = navigator.userAgent.toLowerCase()
  return sUserAgent.match(
    /(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i
  )
}

exports.fixDeviceView = function () {
  var sUserAgent = navigator.userAgent.toLowerCase()
  var pathname
  if (window.location.pathname === '/') {
    pathname = ''
  } else {
    pathname = window.location.pathname
  }

  var isMobileDevice = sUserAgent.match(
      /(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i
    ),
    isMobileView = /^\/m\/*.*$/i.test(window.location.pathname)
  if (isMobileDevice && !isMobileView) {
    // PC跳转移动端
    window.location.href =
      window.location.origin + '/m' + pathname + window.location.search
  } else if (!isMobileDevice && isMobileView) {
    // 移动端跳PC
    window.location.href =
      window.location.origin +
      window.location.pathname.replace('/m', '') +
      window.location.search
  }
}
