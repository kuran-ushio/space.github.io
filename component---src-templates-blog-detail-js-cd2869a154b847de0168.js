(self.webpackChunkgatsby_blog=self.webpackChunkgatsby_blog||[]).push([[465],{7228:function(e){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n},e.exports.default=e.exports,e.exports.__esModule=!0},3646:function(e,t,r){var n=r(7228);e.exports=function(e){if(Array.isArray(e))return n(e)},e.exports.default=e.exports,e.exports.__esModule=!0},9100:function(e,t,r){var n=r(9489),o=r(7067);function a(t,r,l){return o()?(e.exports=a=Reflect.construct,e.exports.default=e.exports,e.exports.__esModule=!0):(e.exports=a=function(e,t,r){var o=[null];o.push.apply(o,t);var a=new(Function.bind.apply(e,o));return r&&n(a,r.prototype),a},e.exports.default=e.exports,e.exports.__esModule=!0),a.apply(null,arguments)}e.exports=a,e.exports.default=e.exports,e.exports.__esModule=!0},9713:function(e){e.exports=function(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e},e.exports.default=e.exports,e.exports.__esModule=!0},7067:function(e){e.exports=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}},e.exports.default=e.exports,e.exports.__esModule=!0},6860:function(e){e.exports=function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)},e.exports.default=e.exports,e.exports.__esModule=!0},8206:function(e){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},e.exports.default=e.exports,e.exports.__esModule=!0},319:function(e,t,r){var n=r(3646),o=r(6860),a=r(379),l=r(8206);e.exports=function(e){return n(e)||o(e)||a(e)||l()},e.exports.default=e.exports,e.exports.__esModule=!0},379:function(e,t,r){var n=r(7228);e.exports=function(e,t){if(e){if("string"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}},e.exports.default=e.exports,e.exports.__esModule=!0},6725:function(e,t,r){var n=r(3395);e.exports={MDXRenderer:n}},3395:function(e,t,r){var n=r(9100),o=r(319),a=r(9713),l=r(7316),c=["scope","children"];function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var u=r(7294),m=r(4983).mdx,d=r(9480).useMDXScope;e.exports=function(e){var t=e.scope,r=e.children,a=l(e,c),i=d(t),p=u.useMemo((function(){if(!r)return null;var e=s({React:u,mdx:m},i),t=Object.keys(e),a=t.map((function(t){return e[t]}));return n(Function,["_fn"].concat(o(t),[""+r])).apply(void 0,[{}].concat(o(a)))}),[r,t]);return u.createElement(p,s({},a))}},1422:function(e,t,r){"use strict";r.d(t,{Z:function(){return c}});var n=r(7294),o=r(5444),a=r(7446),l=[{key:"Home",title:"首页",to:"/"},{key:"Blog",title:"笔记",to:"/m/blog"},{key:"Works",title:"练习",to:"/m/works"}];var c=function(){var e=(0,n.useState)(!1),t=e[0],r=e[1];return n.createElement("header",{className:"mHeader-module--header--3VpTH"},n.createElement("div",{className:"mHeader-module--header-bar--29-4_"},n.createElement("div",{className:"mHeader-module--icon--E8UBq"},n.createElement("img",{src:a.Z,alt:"avatar"})),n.createElement("div",{className:"mHeader-module--top-info--32z56"},n.createElement("div",null,"Ushio"),n.createElement("span",null,"To reveal all mysteries and doubts, have the lust for life.")),n.createElement("div",{className:"mHeader-module--top-close--1Mo6L",onClick:function(){r(!t)},role:"button"},n.createElement("div",{className:t?"mHeader-module--close-active--1zALV":"mHeader-module--close-off--1-nuD"})),t&&n.createElement("div",{className:"mHeader-module--top-menu--1kKFv"},n.createElement("ul",null,l.map((function(e){return n.createElement("li",{key:e.key},n.createElement(o.rU,{to:e.to},e.title),n.createElement("div",{className:"mHeader-module--divider--31zPb"}))}))))))}},8345:function(e,t,r){"use strict";var n=r(7294);t.Z=function(){return n.createElement("footer",{className:"linear-bg"})}},6684:function(e,t,r){"use strict";r.d(t,{Z:function(){return l}});var n=r(7294),o=r(5444),a=[{key:"Home",title:"首页",to:"/"},{key:"Blog",title:"笔记",to:"/blog"},{key:"Works",title:"练习",to:"/works"}];var l=function(e){return n.createElement("header",{className:"topnav-module--top-nav--3H5jB"},n.createElement("div",{className:"linear-bg"}),n.createElement("div",{className:"topnav-module--nav-bar--2U4uD"},n.createElement("ul",null,a.map((function(t){return n.createElement("li",{key:t.key,className:e.active===t.key?"topnav-module--li-active--vd_oh":null},n.createElement(o.rU,{to:t.to},t.title,n.createElement("span",{className:"topnav-module--title-en--1Av9d"}," / ",t.key)))})))))}},9728:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return m}});var n=r(7294),o=r(5444),a=r(6725),l=r(6684),c=r(1422),i=r(8345),s=r(7446),u=r(7720);var m=function(e){var t=e.data,r=e.pageContext,m=t.mdx,d=m.frontmatter,p=m.body,f=(0,u.EY)();return n.createElement("div",{className:"page"},n.createElement("title",null,"Blog - My Space"),f?n.createElement(c.Z,null):n.createElement(l.Z,null),n.createElement("main",{className:"blog-module--main-blog--1z6TP"},n.createElement("div",{className:"blog-module--blog-container--25Rxj"},n.createElement("h2",{className:"blog-module--blog-title--2U1n_"},d.title),n.createElement("div",{className:"blog-module--base-info--3EtW0"},n.createElement("div",{className:"blog-module--author--dO1z-"},n.createElement("div",{className:"blog-module--avatar--2Uucy"},n.createElement("img",{src:s.Z,alt:"avatar"})),n.createElement("span",null,"Ushio")),n.createElement("div",{className:"blog-module--blog-time--3WQVR"},"发布于 ",d.date)),n.createElement("div",{className:"markdown-body"},n.createElement(a.MDXRenderer,null,p)),n.createElement("div",{className:"blog-module--pager--2epyw"},r.previous&&n.createElement("div",{className:"blog-module--pager-prev--1qOLG",title:"上一篇"},n.createElement(o.rU,{to:r.previous},"上一篇"),f&&n.createElement("span",null,"上一篇")),r.next&&n.createElement("div",{className:"blog-module--pager-next--lGEpe",title:"下一篇"},f&&n.createElement("span",null,"下一篇"),n.createElement(o.rU,{to:r.next},"下一篇"))))),!f&&n.createElement(i.Z,null))}},7720:function(e,t){t.Vs=function(e){return e>999?"999+":e+""},t.EY=function(){return navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i)},t.AD=function(){var e,t=navigator.userAgent.toLowerCase();e="/"===window.location.pathname?"":window.location.pathname;var r=t.match(/(ipad|ipod|iphone os|midp|ucweb|android|windows ce|windows mobile)/i),n=/^\/m\/*.*$/i.test(window.location.pathname);r&&!n?window.location.href=window.location.origin+"/m"+e+window.location.search:!r&&n&&(window.location.href=window.location.origin+window.location.pathname.replace("/m","")+window.location.search)}},7446:function(e,t,r){"use strict";t.Z=r.p+"static/avatar-a245f5a141ee7672fd4950d820091a5b.jpeg"}}]);
//# sourceMappingURL=component---src-templates-blog-detail-js-cd2869a154b847de0168.js.map