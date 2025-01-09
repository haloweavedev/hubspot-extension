function createNotionButton() {
    // Check if we're on a deal record page
    if (!window.location.href.match(/\/record\/0-3\/\d+$/)) {
      return;
    }
  
    // Function to extract Notion URL
    function getNotionUrl() {
      const textarea = document.querySelector('textarea[data-selenium-test="property-input-gpt_url"]');
      return textarea ? textarea.value : null;
    }
  
    // Create Notion button
    function addNotionButton() {
      const tabList = document.querySelector('.private-tabs__list');
      if (!tabList || document.querySelector('.notion-tab')) {
        return; // Exit if tab list not found or button already exists
      }
  
      const notionTab = document.createElement('a');
      notionTab.className = 'private-link uiLinkWithoutUnderline UITab__StyledLink-d78hoc-2 jcwBLG private-tab private-link--unstyled notion-tab';
      notionTab.setAttribute('role', 'button');
      notionTab.setAttribute('tabindex', '0');
      notionTab.textContent = 'Notion';
  
      // Add indicator span (for styling consistency)
      const indicator = document.createElement('span');
      indicator.className = 'UITab__TabIndicator-d78hoc-0 bjfjBP private-tab__indicator';
      notionTab.appendChild(indicator);
  
      // Add click handler
      notionTab.addEventListener('click', () => {
        const notionUrl = getNotionUrl();
        if (notionUrl) {
          window.open(notionUrl, '_blank');
        } else {
          console.log('No Notion URL found');
        }
      });
  
      tabList.appendChild(notionTab);
    }
  
    // Initial setup
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          addNotionButton();
        }
      }
    });
  
    // Start observing for dynamic content changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  
    // Try to add button immediately in case content is already loaded
    addNotionButton();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNotionButton);
  } else {
    createNotionButton();
  }