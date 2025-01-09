// content.js
function createNotionButton() {
  // Check if we're on a deal record page
  const urlPattern = /\/record\/0-3\/\d+\/?$/;
  if (!urlPattern.test(window.location.href)) return;

  let notionWindow = null;

  function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[Notion Extension ${timestamp}] ${message}`);
    if (data) console.log('Data:', data);
  }

  function getNotionUrl() {
    const textarea = document.querySelector('textarea[data-selenium-test="property-input-notion_url"]');
    return textarea ? textarea.value.trim() : null;
  }

  function openNotionWindow(url) {
    debugLog('Opening Notion window:', url);

    // Close existing window if open
    if (notionWindow && !notionWindow.closed) {
      notionWindow.close();
    }

    // Calculate window size (80% of screen size)
    const width = Math.min(1200, window.screen.width * 0.8);
    const height = Math.min(800, window.screen.height * 0.8);
    
    // Calculate centered position
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Open new window
    notionWindow = window.open(
      url,
      'NotionWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    // Focus the window
    if (notionWindow) notionWindow.focus();
  }

  // Create Notion button
  function addNotionButton() {
    const tabList = document.querySelector('[role="navigation"], [class*="UITabs__StyledList"], .private-tabs__list');
    if (!tabList || document.querySelector('.notion-tab')) return;

    const existingTab = tabList.querySelector('a[role="button"]');
    const notionTab = document.createElement('a');
    
    if (existingTab) {
      const baseClasses = existingTab.className
        .split(' ')
        .filter(cls => !cls.includes('active'))
        .join(' ');
      notionTab.className = `${baseClasses} notion-tab`;
    } else {
      notionTab.className = 'private-link private-tab notion-tab';
    }

    notionTab.setAttribute('role', 'button');
    notionTab.setAttribute('tabindex', '0');
    notionTab.textContent = 'Notion';

    if (existingTab) {
      const indicator = existingTab.querySelector('span[class*="TabIndicator"]');
      if (indicator) {
        const newIndicator = document.createElement('span');
        newIndicator.className = indicator.className;
        notionTab.appendChild(newIndicator);
      }
    }

    notionTab.addEventListener('click', () => {
      const url = getNotionUrl();
      if (url) {
        openNotionWindow(url);
      } else {
        debugLog('No Notion URL found');
      }
    });

    tabList.appendChild(notionTab);
    debugLog('Button added');
  }

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    if (!document.querySelector('.notion-tab')) addNotionButton();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  addNotionButton();
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createNotionButton);
} else {
  createNotionButton();
}