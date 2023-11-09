document.addEventListener("DOMContentLoaded",()=>{let t=!1,r,n=!0,e=CONFIG.path;0===e.length?e="search.xml":e.endsWith("json")&&(n=!1);const o=document.querySelector(".search-input"),s=document.getElementById("search-result"),v=(e,t,r)=>{CONFIG.localsearch.unescape&&((n=document.createElement("div")).innerText=e,e=n.innerHTML);var n,o=e.length;if(0===o)return[];let s=0;var l,a=[];for(r||(t=t.toLowerCase(),e=e.toLowerCase());-1<(l=t.indexOf(e,s));)a.push({position:l,word:e}),s=l+o;return a},C=(e,t,r,n)=>{var o;let{position:s,word:l}=r[r.length-1];var a=[];let i=0;for(;s+l.length<=t&&0!==r.length;){l===n&&i++,a.push({position:s,length:l.length});var c=s+l.length;for(r.pop();0!==r.length&&(o=r[r.length-1],s=o.position,l=o.word,c>s);)r.pop()}return{hits:a,start:e,end:t,searchTextCount:i}},m=(r,e)=>{let n="",o=e.start;return e.hits.forEach(e=>{n+=r.substring(o,e.position);var t=e.position+e.length;n+=`<b class="search-keyword">${r.substring(e.position,t)}</b>`,o=t}),n+=r.substring(o,e.end)},l=()=>{if(t){let p=o.value.trim().toLowerCase(),g=p.split(/[-\s]+/),f=(1<g.length&&g.push(p),[]);0<p.length&&r.forEach(({title:e,content:n,url:o})=>{let t=e.toLowerCase(),r=n.toLowerCase(),s=[],l=[],a=0;if(g.forEach(e=>{s=s.concat(v(e,t,!1)),l=l.concat(v(e,r,!1))}),0<s.length||0<l.length){var i=s.length+l.length,c=([s,l].forEach(e=>{e.sort((e,t)=>t.position!==e.position?t.position-e.position:e.word.length-t.word.length)}),[]);0!==s.length&&(d=C(0,e.length,s,p),a+=d.searchTextCountInSlice,c.push(d));let r=[];for(;0!==l.length;){var{position:h,word:u}=l[l.length-1];let e=h-20,t=h+80;e<0&&(e=0),(t=t<h+u.length?h+u.length:t)>n.length&&(t=n.length);h=C(e,t,l,p);a+=h.searchTextCountInSlice,r.push(h)}r.sort((e,t)=>e.searchTextCount!==t.searchTextCount?t.searchTextCount-e.searchTextCount:e.hits.length!==t.hits.length?t.hits.length-e.hits.length:e.start-t.start);var d=parseInt(CONFIG.localsearch.top_n_per_article,10);0<=d&&(r=r.slice(0,d));let t="";t+=0!==c.length?`<li><a href="${o}" class="search-result-title">${m(e,c[0])}</a>`:`<li><a href="${o}" class="search-result-title">${e}</a>`,r.forEach(e=>{t+=`<a href="${o}"><p class="search-result">${m(n,e)}...</p></a>`}),t+="</li>",f.push({item:t,id:f.length,hitCount:i,searchTextCount:a})}}),1===g.length&&""===g[0]?s.innerHTML='<div id="no-result"><i class="fa fa-search fa-5x"></i></div>':0===f.length?s.innerHTML='<div id="no-result"><i class="far fa-frown fa-5x"></i></div>':(f.sort((e,t)=>e.searchTextCount!==t.searchTextCount?t.searchTextCount-e.searchTextCount:e.hitCount!==t.hitCount?t.hitCount-e.hitCount:t.id-e.id),s.innerHTML=`<ul class="search-result-list">${f.map(e=>e.item).join("")}</ul>`,window.pjax&&window.pjax.refresh(s))}},a=()=>{fetch(CONFIG.root+e).then(e=>e.text()).then(e=>{t=!0,r=(r=n?[...(new DOMParser).parseFromString(e,"text/xml").querySelectorAll("entry")].map(e=>({title:e.querySelector("title").textContent,content:e.querySelector("content").textContent,url:e.querySelector("url").textContent})):JSON.parse(e)).filter(e=>e.title).map(e=>(e.title=e.title.trim(),e.content=e.content?e.content.trim().replace(/<[^>]+>/g,""):"",e.url=decodeURIComponent(e.url).replace(/\/{2,}/g,"/"),e)),document.getElementById("no-result").innerHTML='<i class="fa fa-search fa-5x"></i>',l()})},i=(CONFIG.localsearch.preload&&a(),"auto"===CONFIG.localsearch.trigger?o.addEventListener("input",l):(document.querySelector(".search-icon").addEventListener("click",l),o.addEventListener("keypress",e=>{"Enter"===e.key&&l()})),document.querySelectorAll(".popup-trigger").forEach(e=>{e.addEventListener("click",()=>{document.body.style.overflow="hidden",document.querySelector(".search-pop-overlay").classList.add("search-active"),o.focus(),t||a()})}),()=>{document.body.style.overflow="",document.querySelector(".search-pop-overlay").classList.remove("search-active")});document.querySelector(".search-pop-overlay").addEventListener("click",e=>{e.target===document.querySelector(".search-pop-overlay")&&i()}),document.querySelector(".popup-btn-close").addEventListener("click",i),window.addEventListener("pjax:success",i),window.addEventListener("keyup",e=>{"Escape"===e.key&&i()})});