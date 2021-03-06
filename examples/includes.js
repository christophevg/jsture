var scripts = [ 
  "src/jsture.js" 
, "src/Element.js"
, "src/Pattern.js"
, "src/Watcher.js"
, "src/Display.js"
];

function addScript(url) {
  document.writeln( "<script type=\"text/javascript\" src=\"" + url + "\"></script>" );
}

function loadScripts(prefix) {
  for( var i=0; i<scripts.length; i++ ) {
    addScript(prefix + scripts[i]);
  }
}

if( typeof window.loadingPrefix == "undefined" ) {
  window.loadingPrefix = "../";
}

loadScripts(window.loadingPrefix);
