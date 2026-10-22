---
title: "Categoria"
layout: single
permalink: /categoria/
author_profile: false
classes: wide
---

<style>
#page-title{display:none}
.cat-header{margin-bottom:1.5em}
.cat-header-name{font-size:1.8em;font-weight:800;color:#1a1a2e;margin:0 0 .3em}
.cat-header-desc{font-size:14px;color:#888;margin:0}
.cat-back{font-size:13px;color:#3f6b00;text-decoration:none;display:inline-block;margin-bottom:1.2em}
.cat-back:hover{text-decoration:underline}
.art-list{display:flex;flex-direction:column;gap:.8em}
.art-row{display:flex;gap:1.2em;align-items:flex-start;background:#fff;border:1.5px solid #eee;border-radius:12px;padding:1em 1.2em;text-decoration:none;color:inherit;transition:box-shadow .15s,border-color .15s}
.art-row:hover{border-color:#95d600;box-shadow:0 4px 16px rgba(149,214,0,.10);text-decoration:none}
.art-row-img{width:90px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0}
.art-row-img-ph{width:90px;height:70px;border-radius:8px;flex-shrink:0;background:#f0f0f8;display:flex;align-items:center;justify-content:center;font-size:1.6em;color:#ccc}
.art-row-body{flex:1;min-width:0}
.art-row-date{font-size:11px;color:#bbb;margin-bottom:.3em}
.art-row-title{font-size:.95em;font-weight:700;color:#1a1a2e;margin-bottom:.3em;line-height:1.4}
.art-row-excerpt{font-size:13px;color:#888;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat-empty{color:#bbb;font-size:14px;padding:2em 0;text-align:center}
</style>

<a class="cat-back" href="{{ '/categorie/' | relative_url }}">← Tutte le categorie</a>
<div id="cat-container"><div class="cat-empty">⏳ Caricamento...</div></div>

<script>
const SITE_POSTS = [
  {% for post in site.posts %}
  {
    title: {{ post.title | jsonify }},
    url: "{{ post.url | relative_url }}",
    date: "{{ post.date | date: '%d %b %Y' }}",
    excerpt: {{ post.excerpt | strip_html | truncate: 120 | jsonify }},
    image: {{ post.header.teaser | default: "" | jsonify }},
    categories: {{ post.categories | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];

(function(){
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat') || '';
  const container = document.getElementById('cat-container');
  if(!cat){ container.innerHTML = '<div class="cat-empty">Nessuna categoria specificata.</div>'; return; }

  const CAT_DATA = {{ site.data.categorie | jsonify }};
  const catInfo = (CAT_DATA||[]).find(c => c.nome === cat) || {};
  const posts = SITE_POSTS.filter(p => p.categories && p.categories.includes(cat));

  document.title = cat + ' — Categorie';

  let html = `<div class="cat-header">
    <div class="cat-header-name">${cat}</div>
    ${catInfo.descrizione ? `<div class="cat-header-desc">${catInfo.descrizione.replace(/<[^>]*>/g,'')}</div>` : ''}
  </div>`;

  if(!posts.length){
    html += '<div class="cat-empty">Nessun articolo in questa categoria.</div>';
  } else {
    html += '<div class="art-list">';
    posts.forEach(p => {
      const img = p.image
        ? `<img class="art-row-img" src="${p.image}" alt="${p.title}">`
        : `<div class="art-row-img-ph">📄</div>`;
      html += `<a class="art-row" href="${p.url}">
        ${img}
        <div class="art-row-body">
          <div class="art-row-date">${p.date}</div>
          <div class="art-row-title">${p.title}</div>
          <div class="art-row-excerpt">${p.excerpt}</div>
        </div>
      </a>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
})();
</script>
