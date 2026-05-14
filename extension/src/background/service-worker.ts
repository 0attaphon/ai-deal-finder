// MV3 service worker — keeps alive only when needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Deal Finder installed");
});
