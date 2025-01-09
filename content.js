// content.js
function createNotionButton() {
  // Check if we're on a deal record page with optional trailing slash
  const urlPattern = /\/record\/0-3\/\d+\/?$/;
  const currentUrl = window.location.href;
  
  debugLog('Checking URL:', currentUrl);
  
  if (!urlPattern.test(currentUrl)) {
    debugLog('Not on deal page, pattern not matched');
    alert("You are not on the correct page.");
    return;
  } else {
    debugLog('On deal page, pattern matched');
    alert("You are on the correct page.");
  }

  let embedContainer = null;

  // Function to extract Notion URL
  function getNotionUrl() {
    const textarea = document.querySelector('textarea[data-selenium-test="property-input-gpt_url"]');
    debugLog('Found textarea:', textarea);
    if (textarea) {
      const url = textarea.value.trim();
      debugLog('Extracted URL:', url);
      return url;
    }
    debugLog('No textarea found');
    return null;
  }

  // Debug function
  function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[Notion Extension ${timestamp}] ${message}`);
    if (data) {
      console.log('Data:', data);
    }
  }

  // Function to embed Notion
  async function embedNotion(url) {
    debugLog('Attempting to embed Notion:', url);

    // Remove existing embed if any
    if (embedContainer) {
      embedContainer.remove();
    }

    // Create embed container
    embedContainer = document.createElement('div');
    embedContainer.className = 'notion-embed-container';

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'notion-loading';
    loadingDiv.innerHTML = 'Loading Notion...';
    embedContainer.appendChild(loadingDiv);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notion-embed-close';
    closeButton.innerHTML = '✕';
    closeButton.onclick = () => embedContainer.remove();
    embedContainer.appendChild(closeButton);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'notion-embed-iframe';
    iframe.src = url;
    iframe.allow = 'fullscreen';

    // Add iframe to container
    embedContainer.appendChild(iframe);

    // Find target container using multiple selectors
    const targetContainer = document.querySelector('.private-contents') || 
                          document.querySelector('main') || 
                          document.body;
    targetContainer.appendChild(embedContainer);

    // Monitor iframe load status
    iframe.onload = () => {
      debugLog('Iframe loaded');
      loadingDiv.style.display = 'none';
    };

    iframe.onerror = (error) => {
      debugLog('Iframe error:', error);
      loadingDiv.innerHTML = 'Error loading Notion. Try opening in new tab.';
    };
  }

  // Create Notion button
  function addNotionButton() {
    // Try multiple selectors to find the tab list
    const selectors = [
      'div[role="navigation"]',
      'div[class*="UITabs__StyledList"]',
      'div[class*="private-tabs__list"]',
      '.private-tabs__list'
    ];

    const tabList = selectors.reduce((found, selector) => 
      found || document.querySelector(selector), null);

    debugLog('Tab list found:', !!tabList);

    if (!tabList || document.querySelector('.notion-tab')) {
      return;
    }

    // Find existing tab to copy styles
    const existingTab = tabList.querySelector('a[role="button"]');
    debugLog('Existing tab found:', !!existingTab);

    const notionTab = document.createElement('a');
    
    if (existingTab) {
      // Copy classes from existing tab
      const baseClasses = existingTab.className
        .split(' ')
        .filter(cls => !cls.includes('active'))
        .join(' ');
      notionTab.className = `${baseClasses} notion-tab`;
    } else {
      // Fallback classes
      notionTab.className = 'private-link private-tab notion-tab';
    }

    notionTab.setAttribute('role', 'button');
    notionTab.setAttribute('tabindex', '0');
    notionTab.textContent = 'Notion';

    // Copy indicator style from existing tab
    if (existingTab) {
      const existingIndicator = existingTab.querySelector('span[class*="TabIndicator"], span[class*="tab__indicator"]');
      if (existingIndicator) {
        const indicator = document.createElement('span');
        indicator.className = existingIndicator.className;
        notionTab.appendChild(indicator);
      }
    }

    notionTab.addEventListener('click', () => {
      const notionUrl = getNotionUrl();
      if (notionUrl) {
        embedNotion(notionUrl);
      } else {
        debugLog('No Notion URL found');
      }
    });

    tabList.appendChild(notionTab);
    debugLog('Notion button added successfully');
  }

  // Initial setup with retry mechanism
  let retryCount = 0;
  const maxRetries = 5;

  function tryAddButton() {
    if (retryCount >= maxRetries) {
      debugLog('Max retries reached, giving up');
      return;
    }

    if (!document.querySelector('.notion-tab')) {
      addNotionButton();
      retryCount++;
      setTimeout(tryAddButton, 1000);
    }
  }

  // Start trying to add the button
  tryAddButton();

  // Observe DOM changes
  const observer = new MutationObserver((mutations) => {
    if (!document.querySelector('.notion-tab')) {
      addNotionButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createNotionButton);
} else {
  createNotionButton();
}