    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const wikiContent = document.getElementById('wikiContent');
    
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        showPage(pageId);
        
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
    
    function showPage(pageId) {
      const pages = document.querySelectorAll('.tab-content');
      pages.forEach(page => page.classList.remove('active'));
      
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      sidebarItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.dataset.page) {
        e.preventDefault();
        const pageId = e.target.dataset.page;
        showPage(pageId);
        
        sidebarItems.forEach(item => {
          if (item.dataset.page === pageId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });