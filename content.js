// content.js
function createNotionButton() {
  // Check if we're on a deal record page
  if (!window.location.href.match(/\/record\/0-3\/\d+$/)) {
    return;
  }

  let embedContainer = null;

  // Function to extract Notion URL
  function getNotionUrl() {
    const textarea = document.querySelector('textarea[data-selenium-test="property-input-gpt_url"]');
    console.log('Found textarea:', textarea);
    if (textarea) {
      console.log('Extracted URL:', textarea.value);
      return textarea.value;
    }
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

  // Function to get proxied URL
  function getProxiedUrl(url) {
    // Using allorigins.win as a CORS proxy
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
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

    // Create main content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'notion-content-wrapper';

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

    try {
      // First try direct embedding
      const iframe = document.createElement('iframe');
      iframe.className = 'notion-embed-iframe';
      iframe.src = url;
      iframe.allow = 'fullscreen';
      
      contentWrapper.appendChild(iframe);
      embedContainer.appendChild(contentWrapper);

      // Add to HubSpot DOM
      const targetContainer = document.querySelector('.private-contents') || document.body;
      targetContainer.appendChild(embedContainer);

      // Monitor iframe load status
      iframe.onload = () => {
        debugLog('Iframe loaded');
        loadingDiv.style.display = 'none';
        try {
          // Try to access iframe content
          const iframeDoc = iframe.contentWindow.document;
          debugLog('Successfully accessed iframe content');
        } catch (e) {
          debugLog('Error accessing iframe content:', e);
          // Try proxy approach
          tryProxyApproach(url);
        }
      };

    } catch (error) {
      debugLog('Error with direct embed:', error);
      tryProxyApproach(url);
    }
  }

  // Function to try proxy approach
  async function tryProxyApproach(url) {
    debugLog('Attempting proxy approach');
    try {
      const proxyUrl = getProxiedUrl(url);
      const response = await fetch(proxyUrl);
      const html = await response.text();

      // Create a new iframe with the proxied content
      const iframe = document.createElement('iframe');
      iframe.className = 'notion-embed-iframe';
      iframe.srcdoc = html;
      iframe.allow = 'fullscreen';

      // Replace existing content
      const contentWrapper = embedContainer.querySelector('.notion-content-wrapper');
      contentWrapper.innerHTML = '';
      contentWrapper.appendChild(iframe);
      
      const loadingDiv = embedContainer.querySelector('.notion-loading');
      if (loadingDiv) loadingDiv.style.display = 'none';

    } catch (error) {
      debugLog('Proxy approach failed:', error);
      const loadingDiv = embedContainer.querySelector('.notion-loading');
      if (loadingDiv) {
        loadingDiv.innerHTML = 'Unable to load Notion content. Try opening in a new tab.';
      }
    }
  }

  // Create Notion button
  function addNotionButton() {
    const tabList = document.querySelector('.private-tabs__list');
    if (!tabList || document.querySelector('.notion-tab')) {
      return;
    }

    const notionTab = document.createElement('a');
    notionTab.className = 'private-link uiLinkWithoutUnderline UITab__StyledLink-d78hoc-2 jcwBLG private-tab private-link--unstyled notion-tab';
    notionTab.setAttribute('role', 'button');
    notionTab.setAttribute('tabindex', '0');
    notionTab.textContent = 'Notion';

    const indicator = document.createElement('span');
    indicator.className = 'UITab__TabIndicator-d78hoc-0 bjfjBP private-tab__indicator';
    notionTab.appendChild(indicator);

    notionTab.addEventListener('click', () => {
      const notionUrl = getNotionUrl();
      if (notionUrl) {
        embedNotion(notionUrl);
      } else {
        console.log('No Notion URL found');
      }
    });

    tabList.appendChild(notionTab);
    debugLog('Notion button added');
  }

  // Initial setup
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        addNotionButton();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  addNotionButton();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createNotionButton);
} else {
  createNotionButton();
}