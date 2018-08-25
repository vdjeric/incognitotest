'use strict';	
	
const UserAgent = require('UserAgent');	
const WebStorage = require('WebStorage');	
	
async function incognito(): Promise<boolean> {
  // Chrome: RequestFileSystem can't be written to in incognito mode	
  // Support: Chrome 13+	
  const fs = window.RequestFileSystem || window.webkitRequestFileSystem;	
  if (fs) {
    return new Promise(resolve =>	
      fs(window.TEMPORARY, 10, () => resolve(false), () => resolve(true)),	
    );	
  }	
	
  // IE10+, Edge: indexedDB doesn't exist in private mode	
  if (UserAgent.isBrowser('IE >= 10') || UserAgent.isBrowser('Edge')) {	
    return !window.indexedDB;	
  }	
	
  // Firefox: indexedDB errors when opened. This will get fixed at some point:	
  // https://bugzilla.mozilla.org/show_bug.cgi?id=781982	
  if (UserAgent.isBrowser('Firefox >= 16')) {	
    return new Promise(resolve => {	
      const db = window.indexedDB.open('__test__');	
      db.onsuccess = () => resolve(false);	
      db.onerror = e => {	
        e.preventDefault(); // prevent InvalidStateException from hitting global	
        resolve(true);	
      };	
    });	
  }	
	
  // Safari: localStorage is disabled	
  if (UserAgent.isBrowser('Safari')) {	
    return !WebStorage.getLocalStorage();	
  }	
	
  // We don't know any better, so assume not incognito	
  return false;	
}	
