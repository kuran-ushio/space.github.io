(self.webpackChunkgatsby_blog=self.webpackChunkgatsby_blog||[]).push([[102],{1422:function(e,t,a){"use strict";a.d(t,{Z:function(){return o}});var n=a(7294),r=a(5444),l=a(7446),i=[{key:"Home",title:"首页",to:"/"},{key:"Blog",title:"笔记",to:"/m/blog"},{key:"Works",title:"练习",to:"/m/works"}];var o=function(){var e=(0,n.useState)(!1),t=e[0],a=e[1];return n.createElement("header",{className:"mHeader-module--header--3VpTH"},n.createElement("div",{className:"mHeader-module--header-bar--29-4_"},n.createElement("div",{className:"mHeader-module--icon--E8UBq"},n.createElement("img",{src:l.Z,alt:"avatar"})),n.createElement("div",{className:"mHeader-module--top-info--32z56"},n.createElement("div",null,"Ushio"),n.createElement("span",null,"To reveal all mysteries and doubts, have the lust for life.")),n.createElement("div",{className:"mHeader-module--top-close--1Mo6L",onClick:function(){a(!t)},role:"button"},n.createElement("div",{className:t?"mHeader-module--close-active--1zALV":"mHeader-module--close-off--1-nuD"})),t&&n.createElement("div",{className:"mHeader-module--top-menu--1kKFv"},n.createElement("ul",null,i.map((function(e){return n.createElement("li",{key:e.key},n.createElement(r.rU,{to:e.to},e.title),n.createElement("div",{className:"mHeader-module--divider--31zPb"}))}))))))}},5331:function(e,t,a){"use strict";var n=a(7294),r=a(1422);t.Z=function(e){var t=e.pageTitle,a=e.siteTitle,l=e.children;return n.createElement("div",{className:"page"},n.createElement("title",null,t," - ",a),n.createElement(r.Z,null),l)}},5609:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return p}});var n=a(6156),r=a(7294),l=a(5444),i=a(5331),o=a(7720),c="mTrend-module--article-title--Spi9a",m="mTrend-module--article-ft--3dduM",s="mTrend-module--article-time--3IaLk";function d(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function u(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?d(Object(a),!0).forEach((function(t){(0,n.Z)(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):d(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}var p=function(e){var t=e.data,a=t.allMdx,n=t.allWorks,d=t.site,p=a.edges.map((function(e){var t=JSON.parse(JSON.stringify(e));return t.node.dataType="md",u({},t)})),f=n.edges.map((function(e){var t=JSON.parse(JSON.stringify(e));return t.node.dataType="json",u({},t)})),w=p.concat(f).slice(0,7).sort((function(e,t){return new Date(t.node.frontmatter.date)-new Date(e.node.frontmatter.date)}));return(0,r.useEffect)((function(){(0,o.AD)()}),[]),r.createElement(i.Z,{pageTitle:"Home",siteTitle:d.siteMetadata.title},r.createElement("main",null,r.createElement("div",{className:"mTrend-module--section-title--q7qcP"},"动态"),r.createElement("div",null,r.createElement("ul",{className:"mTrend-module--trend-list--4ddBE"},w.map((function(e){var t=e.node,a=t.frontmatter;return r.createElement("li",{className:"mTrend-module--trend-item--3apeV",key:t.id},"md"===t.dataType?function(e){var t=e.tag.split(",");return r.createElement("article",null,r.createElement("div",{className:c},r.createElement("span",null,"发布了笔记《 "),r.createElement(l.rU,{to:e.slug,className:c},e.title),r.createElement("span",null," 》")),r.createElement("p",{className:"mTrend-module--article-brief--3Kf8-"},e.brief),r.createElement("div",{className:m},t.length>0&&r.createElement("div",{className:"mTrend-module--article-tag--1_CYb"},t.map((function(e){return r.createElement("span",{key:e},e)}))),r.createElement("div",{className:s},e.date)))}(a):function(e){var t=e.images.split(","),a=e.techs.split(",");return r.createElement("article",null,r.createElement("p",{className:c},r.createElement("span",null,"添加了练习《 "),r.createElement(l.rU,{to:e.slug},e.title),r.createElement("span",null," 》")),t.length>0&&r.createElement("div",{className:"mTrend-module--article-works--3Q6Kp"},t.map((function(e){return r.createElement("div",{className:"mTrend-module--works-img--1rS28",key:e},r.createElement("img",{src:"images/"+e,alt:"works"}))}))),r.createElement("div",{className:m,style:{marginTop:10}},a.length>0&&r.createElement("div",{className:"mTrend-module--works-tag--1gJui"},a.map((function(e){return r.createElement("span",{key:e},e)}))),r.createElement("div",{className:s},e.date)))}(a))}))))))}},7720:function(e,t){t.Vs=function(e){return e>999?"999+":e+""};var a=function(){return"undefined"!=typeof window};t.EY=function(){if(a())return window.navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i)},t.AD=function(){if(a()){var e,t=window.navigator.userAgent.toLowerCase();e="/"===window.location.pathname?"":window.location.pathname;var n=t.match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i),r=/^\/m\/*.*$/i.test(window.location.pathname);n&&!r?window.location.href=window.location.origin+"/m"+e+window.location.search:!n&&r&&(window.location.href=window.location.origin+window.location.pathname.replace("/m","")+window.location.search)}}},7446:function(e,t,a){"use strict";t.Z=a.p+"static/avatar-a245f5a141ee7672fd4950d820091a5b.jpeg"}}]);
//# sourceMappingURL=component---src-pages-m-index-js-93340f5c763d59f4012b.js.map