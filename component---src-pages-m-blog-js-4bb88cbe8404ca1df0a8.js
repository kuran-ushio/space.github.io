(self.webpackChunkgatsby_blog=self.webpackChunkgatsby_blog||[]).push([[484],{1422:function(e,t,a){"use strict";a.d(t,{Z:function(){return i}});var n=a(7294),l=a(5444),o=a(7446),r=[{key:"Home",title:"首页",to:"/"},{key:"Blog",title:"笔记",to:"/m/blog"},{key:"Works",title:"练习",to:"/m/works"}];var i=function(){var e=(0,n.useState)(!1),t=e[0],a=e[1];return n.createElement("header",{className:"mHeader-module--header--3VpTH"},n.createElement("div",{className:"mHeader-module--header-bar--29-4_"},n.createElement("div",{className:"mHeader-module--icon--E8UBq"},n.createElement("img",{src:o.Z,alt:"avatar"})),n.createElement("div",{className:"mHeader-module--top-info--32z56"},n.createElement("div",null,"Ushio"),n.createElement("span",null,"To reveal all mysteries and doubts, have the lust for life.")),n.createElement("div",{className:"mHeader-module--top-close--1Mo6L",onClick:function(){a(!t)},role:"button"},n.createElement("div",{className:t?"mHeader-module--close-active--1zALV":"mHeader-module--close-off--1-nuD"})),t&&n.createElement("div",{className:"mHeader-module--top-menu--1kKFv"},n.createElement("ul",null,r.map((function(e){return n.createElement("li",{key:e.key},n.createElement(l.rU,{to:e.to},e.title),n.createElement("div",{className:"mHeader-module--divider--31zPb"}))}))))))}},5331:function(e,t,a){"use strict";var n=a(7294),l=a(1422);t.Z=function(e){var t=e.pageTitle,a=e.siteTitle,o=e.children;return n.createElement("div",{className:"page"},n.createElement("title",null,t," - ",a),n.createElement(l.Z,null),o)}},3957:function(e,t,a){"use strict";var n=a(7294);t.Z=function(e){var t=e.pageCount,a=e.curPage,l=e.onPageChange;return n.createElement("div",{className:"pager"},a>1&&n.createElement("button",{"aria-label":"previous page",className:"pager-btn pager-prev",onClick:function(){l(a-1)}},"上一页"),n.createElement("span",null,a," / ",t),a<t&&n.createElement("button",{"aria-label":"next page",className:"pager-btn pager-next",onClick:function(){l(a+1)}},"下一页"))}},3709:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return m}});var n=a(7294),l=a(5444),o=a(5331),r=a(3957),i=a(792),c=a(7720);var m=function(e){var t=e.data,a=t.allMdx,m=t.site,s=(0,n.useState)(1),u=s[0],d=s[1],g=(0,n.useState)(a&&a.edges?a.edges.slice(0,10):[]),f=g[0],v=g[1],p=Math.ceil(a.totalCount/10);return(0,n.useEffect)((function(){(0,c.AD)()}),[]),n.createElement(o.Z,{pageTitle:"Blog",siteTitle:m.siteMetadata.title},n.createElement("div",{className:"mBlogs-module--section-title--DX8on"},"博客列表"),n.createElement("main",{className:i.L1},n.createElement("ul",{className:i.Lb},f.map((function(e){var t=e.node,a=t.frontmatter,o=a.tag.split(",");return n.createElement("li",{key:t.id},n.createElement("article",{className:"mBlogs-module--trend-article--c55o_"},n.createElement(l.rU,{to:a.slug},n.createElement("div",{className:"mBlogs-module--article-info--3-vkb"},n.createElement("h3",{className:"mBlogs-module--article-title--38Vzo"},a.title),n.createElement("p",{className:"mBlogs-module--article-brief--3O72W"},a.brief),a.cover&&n.createElement("div",{className:"mBlogs-module--article-cover--3bl_B"},n.createElement("img",{src:"/images/"+a.cover,alt:"cover"})),n.createElement("div",{className:"mBlogs-module--article-ft--2w5Ib"},o.length>0&&n.createElement("div",{className:"mBlogs-module--article-tag--3AG1h"},o.map((function(e){return n.createElement("span",{key:e},e)}))),n.createElement("div",{className:"mBlogs-module--article-time--2bff3"},"发布于 ",t.frontmatter.date))))))}))),n.createElement(r.Z,{pageCount:p,curPage:u,onPageChange:function(e){v(a.edges.slice(10*(e-1),10*e)),d(e)}})))}},7720:function(e,t){t.Vs=function(e){return e>999?"999+":e+""},t.EY=function(){return navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i)},t.AD=function(){var e,t=navigator.userAgent.toLowerCase();e="/"===window.location.pathname?"":window.location.pathname;var a=t.match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i),n=/^\/m\/*.*$/i.test(window.location.pathname);a&&!n?window.location.href=window.location.origin+"/m"+e+window.location.search:!a&&n&&(window.location.href=window.location.origin+window.location.pathname.replace("/m","")+window.location.search)}},792:function(e,t,a){"use strict";a.d(t,{I0:function(){return n},D1:function(){return l},L1:function(){return o},Lb:function(){return r}});var n="blogs-module--page-body--13yed",l="blogs-module--blog-list--2ksjk",o="blogs-module--m-page-body--2tPm0",r="blogs-module--m-blog-list--YBtvw"},7446:function(e,t,a){"use strict";t.Z=a.p+"static/avatar-a245f5a141ee7672fd4950d820091a5b.jpeg"}}]);
//# sourceMappingURL=component---src-pages-m-blog-js-4bb88cbe8404ca1df0a8.js.map