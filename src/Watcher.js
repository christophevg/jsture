jsture.Watcher = Class.extend( {  

  recognize : function recognize( patternStrings ) {
    this.patterns = [];
    $H(patternStrings).iterate( function( name, string ) {
      this.patterns.push( jsture.Pattern.fromString( name, string ) );
    }.scope(this) );
    return this;
  },
  
  displayOn : function displayOn( display ) {
    this.display = new jsture.Display(display)
      .setGridWidth( this.getGridWidth() )
      .setGridHeight( this.getGridHeight() );
    return this;
  },
  
  notify : function notify( notifier ) {
    if( ! this.notifiers ) { this.notifiers = []; }
    this.notifiers.push( notifier );
    return this;
  },
  
  setMonitor : function setMonitor( monitor ) {
    if( !(monitor instanceof jsture.Element) ) {
      monitor = new jsture.Element(monitor);
    } 
    this.monitor = monitor;
    this.wireMonitoring();
    return this;
  },

  wireMonitoring : function wireMonitoring() {
    this.monitor.on( 'mousedown', this.startRecording.scope(this) );
    this.monitor.on( 'mousedrag', this.recordPosition.scope(this) );
    this.monitor.on( 'mouseup',   this.stopRecording .scope(this) );
  },
  
  startRecording : function startRecording(pos) {
    this.clear();
    this.recordPosition(pos);
  },

  recordPosition : function recordPosition(pos) {
    // keep the actual pixel
    this.pixels.push(pos);

    // determine x/y of cell
    var x = Math.floor( pos.x / this.getCellWidth() );
    var y = Math.floor( pos.y / this.getCellHeight() );
    // determine index of x/y position in bitfield
    var index = y * this.getGridWidth() + x;

    this.pattern.set(index);
  },

  stopRecording : function stopRecording(pos) {
    this.clearDisplay();
    this.drawPattern();
    this.drawPixels();
    this.detectPattern();
  },

  clearDisplay : function clearDisplay() {
    this.display.clear();
  },
  
  drawPixels : function drawPixels() {
    this.pixels.iterate( function(pixel) {
      this.display.drawPixel( pixel );
    }.scope(this) );
  },
  
  drawPattern : function drawPattern() {
    var rowSize = this.getGridWidth();
    this.pattern.iterate( function( state, index ) {
      if( state === true ) {
        this.display.drawCell( { left: index % rowSize,
                                 top : Math.floor(index / rowSize) });
      }
    }.scope(this) );
  },
  
  detectPattern : function detectPattern() {
    var bestMatch, bestPattern; 
    this.patterns.iterate( function( pattern ) {
      var match = pattern.compareTo( this.pattern );
      if( ! bestMatch || match <= bestMatch ) { 
        bestMatch = match;
        bestPattern = pattern;
      }
    }.scope(this) );
    this.notifyAbout( 'PatternDetected', bestPattern );
  },

  notifyAbout : function notifyAbout( event, info ) {
    this.notifiers.iterate( function( notifier ) {
      notifier( info );
    } );
  },
  
  clear : function clear() {
    this.pixels = [];
    this.pattern  = new jsture.Pattern();
  },
  
  getCellWidth : function getCellWidth() {
    return this.monitor.getWidth() / this.getGridWidth();
  },
  
  getGridWidth : function getGridWidth() {
    return 8; // TODO: make dynamic
  },
  
  getCellHeight : function getCellHeight() {
    return this.monitor.getHeight() / this.getGridHeight();
  },
  
  getGridHeight : function getGridHeight() {
    return 8; // TODO: make dynamic
  }
  
} );
