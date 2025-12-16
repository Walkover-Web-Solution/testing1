// Cross-Domain Cookie Bridge - Production Ready (ES5 Compatible)
// Embed this script in any domain to track first domain visits
(function() {
  var BRIDGE_URL = "https://lingering-heart-256b.shubhendra-e5e.workers.dev";
  var currentDomain = (window.location.hostname || "").toLowerCase();
  
  // Handle file:// protocol and localhost cases
  if (!currentDomain || currentDomain === '' || window.location.protocol === 'file:') {
    // For testing on file:// protocol, use a test domain
    currentDomain = 'local-test.com';
  }
  
  if (!currentDomain || currentDomain === 'localhost') {
    // For localhost testing, use a recognizable test domain
    currentDomain = 'localhost-test.com';
  }
  
  // Helper function to make request
  function sendRequest() {
    // Check if fetch is available (modern browsers)
    if (typeof fetch !== 'undefined') {
      fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain: currentDomain })
      })
      .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Bridge request failed');
      })
      .then(function(data) {
        if (data && data.first_domain) {
          console.log('First Domain Tracked:', data.first_domain);
          // Optional: Trigger custom event with result
          if (typeof window.onFirstDomainTracked === 'function') {
            window.onFirstDomainTracked(data);
          }
        }
      })
      .catch(function(error) {
        console.warn('Bridge tracking failed:', error.message);
      });
    } else {
      // Fallback for older browsers (XMLHttpRequest)
      var xhr = new XMLHttpRequest();
      xhr.open('POST', BRIDGE_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var data = JSON.parse(xhr.responseText);
              if (data && data.first_domain) {
                console.log('First Domain Tracked:', data.first_domain);
                // Optional: Trigger custom event with result
                if (typeof window.onFirstDomainTracked === 'function') {
                  window.onFirstDomainTracked(data);
                }
              }
            } catch (e) {
              console.warn('Bridge response parsing failed');
            }
          } else {
            console.warn('Bridge request failed:', xhr.status);
          }
        }
      };
      
      xhr.onerror = function() {
        console.warn('Bridge network error');
      };
      
      xhr.send(JSON.stringify({ domain: currentDomain }));
    }
  }
  
  // Execute tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendRequest);
  } else {
    sendRequest();
  }
})();
