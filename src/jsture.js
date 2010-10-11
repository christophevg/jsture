if( ! ProtoJS ) {
  alert( "jsture requires ProtoJS" );
}

// jsture namespace
jsture = {
  // factory method for jsture Watcher
  watch : function watch( monitor ) {
    // overloaded constructor implementation allows the passing of an id
    if( ! ( monitor && 
            monitor.nodeType && 
            monitor.nodeType == Node.ELEMENT_NODE ) )
    {
      monitor = document.getElementById(monitor);
    };
    
    if( ! monitor ) {
      throw "Unknown Monitor.";
    }
    
    return new jsture.Watcher().setMonitor( monitor );
  }
};

