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
      if (textarea) {
        return textarea.value.trim();
      }
      return null;
    }
  
    // Function to embed Notion
    function embedNotion(url) {
      // Validate URL
      try {
        new URL(url);
      } catch (e) {
        console.error('Invalid URL:', url);
        return;
      }
  
      // Remove existing embed if any
      if (embedContainer) {
        embedContainer.remove();
      }
  
      // Create embed container
      embedContainer = document.createElement('div');
      embedContainer.className = 'notion-embed-container';
  
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'notion-embed-iframe';
      iframe.src = url;
      iframe.allow = 'fullscreen';
  
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.className = 'notion-embed-close';
      closeButton.innerHTML = '✕';
      closeButton.onclick = () => embedContainer.remove();
  
      // Append elements
      embedContainer.appendChild(closeButton);
      embedContainer.appendChild(iframe);
  
      // Add to HubSpot DOM
      const targetContainer = document.querySelector('.private-contents') || document.body;
      targetContainer.appendChild(embedContainer);
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
    }
  
    // Observe DOM changes to add the Notion button
    const observer = new MutationObserver(() => {
      addNotionButton();
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  
    // Initial call to add the Notion button
    addNotionButton();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNotionButton);
  } else {
    createNotionButton();
  }  