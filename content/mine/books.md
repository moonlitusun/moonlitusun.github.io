---
title: "我读过的书籍"
type: page
showTableOfContents: true
---

热爱读书和思考，在培养持续输出的能力。

微信读书ID: `月诸清酒`

## 2025年
<div id="books-2025" class="books-grid"></div>

## 2024年
<div id="books-2024" class="books-grid"></div>

## 2023年
<div id="books-2023" class="books-grid"></div>

## 2022年
<div id="books-2022" class="books-grid"></div>

## 2021年
<div id="books-2021" class="books-grid"></div>

## 2020年
<div id="books-2020" class="books-grid"></div>

## 2019年
<div id="books-2019" class="books-grid"></div>

## 2018年
<div id="books-2018" class="books-grid"></div>

## 2017年
<div id="books-2017" class="books-grid"></div>

## 2013年
<div id="books-2013" class="books-grid"></div>

<style>
/* 调整布局，确保侧边栏不遮挡内容 */
.post.container {
  width: 75% !important;
  max-width: 810px !important;
  display: inline-block;
  vertical-align: top;
}

.post-content {
  width: 100% !important;
  max-width: 100% !important;
}

#books-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 美化侧边栏目录 */
#toc {
  padding: 1rem 0;
}

#toc::before {
  content: "📚 目录";
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
}

#toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

#toc ul li {
  margin: 0.5rem 0;
  padding: 0;
}

#toc ul li a {
  display: block;
  padding: 0.5rem 0.75rem;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  line-height: 1.5;
  position: relative;
}

#toc ul li a::before {
  content: "•";
  margin-right: 0.5rem;
  color: #3498db;
  font-weight: bold;
}

#toc ul li a:hover {
  background-color: #f5f5f5;
  color: #3498db;
  padding-left: 1rem;
  transform: translateX(4px);
}

#toc ul li a.active {
  background-color: #e8f4f8;
  color: #3498db;
  font-weight: 600;
  border-left: 3px solid #3498db;
  padding-left: 0.75rem;
}

#toc ul li a.active::before {
  content: "▶";
  margin-right: 0.5rem;
  color: #3498db;
}

/* 年份标题和网格的样式 */
h2 {
  margin-top: 4rem;
  margin-bottom: 2rem;
}

h2:first-of-type {
  margin-top: 2rem;
}

/* 年份标题样式 */
h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #3498db;
  font-weight: 600;
  scroll-margin-top: 80px; /* 为固定侧边栏留出空间 */
}

.year-count {
  font-size: 1rem;
  color: #888;
  font-weight: 400;
  margin-left: 0.5rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
}

.book-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-width: 0; /* 防止内容溢出 */
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.book-cover-placeholder {
  width: 100%;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
  min-height: 180px;
}

.book-cover-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .book-cover-placeholder::before {
  opacity: 1;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  min-height: 3em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.book-title a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.book-title a:hover {
  color: #3498db;
}

.book-meta {
  font-size: 0.8rem;
  color: #666;
  margin-top: auto;
  padding-top: 0.75rem;
}

.book-rating {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 14px;
  font-weight: 600;
  color: white;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 6px rgba(245, 87, 108, 0.35);
}

.book-author {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.4rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式设计 */
@media (min-width: 1600px) {
  .books-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 2.5rem;
  }
}

@media (max-width: 1600px) and (min-width: 1400px) {
  .books-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 1400px) and (min-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.8rem;
  }
}

@media (max-width: 1200px) and (min-width: 992px) {
  .books-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 992px) and (min-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.2rem;
  }
  
  .book-card {
    padding: 1rem;
  }
}

@media (max-width: 768px) and (min-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .book-card {
    padding: 0.9rem;
  }
  
  .book-title {
    font-size: 0.9rem;
    min-height: 2.6em;
  }
  
  .book-cover-placeholder {
    font-size: 0.95rem;
    min-height: 160px;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  
  .book-card {
    padding: 0.75rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .book-title {
    font-size: 0.85rem;
    min-height: 2.4em;
  }
  
  .book-cover-placeholder {
    font-size: 0.85rem;
    min-height: 140px;
  }
  
  .book-meta {
    font-size: 0.7rem;
  }
}
</style>

<script>
(async function() {
  try {
    const response = await fetch('/books-data.json');
    const books = await response.json();
    
    // 按年份分组
    const booksByYear = {};
    books.forEach(book => {
      const year = book.date.substring(0, 4);
      if (!booksByYear[year]) {
        booksByYear[year] = [];
      }
      booksByYear[year].push(book);
    });
    
    // 按年份倒序排列
    const years = Object.keys(booksByYear).sort((a, b) => b.localeCompare(a));
    
    years.forEach(year => {
      const container = document.getElementById(`books-${year}`);
      if (!container) return; // 如果该年份的容器不存在，跳过
      
      const count = booksByYear[year].length;
      const yearHeading = container.previousElementSibling; // 获取前面的h2标题
      
      // 更新标题，添加数量
      if (yearHeading && yearHeading.tagName === 'H2') {
        yearHeading.innerHTML = `${year}年 <span class="year-count">(${count}本)</span>`;
      }
      
      let html = '';
      
      booksByYear[year].forEach(book => {
        const ratingDisplay = book.rating ? `<span class="book-rating">${book.rating}</span>` : '';
        const doubanLink = book.douban ? `href="${book.douban}" target="_blank"` : '';
        const titleLink = doubanLink ? `<a ${doubanLink}>${book.title}</a>` : book.title;
        
        // 生成封面占位符文字（取书名前2-4个字）
        const coverText = book.title.length > 4 ? book.title.substring(0, 4) : book.title;
        
        html += `
          <div class="book-card">
            <div class="book-cover-placeholder">${coverText}</div>
            <div class="book-title">${titleLink}</div>
            <div class="book-meta">
              ${ratingDisplay}
              <div class="book-author">${book.author || '--'}</div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    });
  } catch (error) {
    console.error('Failed to load books data:', error);
    const containers = document.querySelectorAll('[id^="books-"]');
    containers.forEach(container => {
      container.innerHTML = '<p>加载书籍数据失败，请稍后重试。</p>';
    });
  }
})();
</script>
