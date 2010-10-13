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
    this.pixels.push(pos);
  },

  stopRecording : function stopRecording(pos) {
    this.clearDisplay();

    var box            = this.detectBoundingBox(this.pixels);
    var translation    = this.determineTranslation(box);
    var scaleFactor    = this.determineScaleFactor(box);
    
    var centeredPixels = this.translate(this.pixels, translation);
    var scaledPixels   = this.scale(centeredPixels, scaleFactor);

    var detected       = this.detectPattern(scaledPixels);

    this.drawPattern( detected.pattern,        "rgba(128,128,128,1)" );
    this.drawPattern( detected.result.correct, "rgba(0,255,0,0.3)"   );
    this.drawPattern( detected.result.close,   "rgba(255,255,0,0.3)" );
    this.drawPattern( detected.result.wrong,   "rgba(255,0,0,0.3)"   );

    this.drawPixels(this.pixels,    "rgb(255,  0,  0)");
    this.drawPixels(centeredPixels, "rgb(255,255,128)");
    this.drawPixels(scaledPixels,   "rgb(  0,255,  0)");
  },

  clearDisplay : function clearDisplay() {
    this.display.clear();
  },
  
  detectBoundingBox : function detectBoundingBox(pixels) {
    var box = { left : 99999, right : 0, top : 99999, bottom : 0 };
    pixels.iterate( function(pixel) {
      if( pixel.x < box.left   ) { box.left   = pixel.x; }
      if( pixel.x > box.right  ) { box.right  = pixel.x; }
      if( pixel.y < box.top    ) { box.top    = pixel.y; }
      if( pixel.y > box.bottom ) { box.bottom = pixel.y; }
    } );
    // padding
    box.padding = {};
    box.padding.top    = box.top;
    box.padding.bottom = this.monitor.getHeight() - box.bottom;
    box.padding.left   = box.left;
    box.padding.right  = this.monitor.getWidth() - box.right;
    return box;
  },

  determineTranslation : function determineTranslation(box) {
    return { 
      x : ( ( box.padding.left + box.padding.right  ) / 2 ) - box.left,
      y : ( ( box.padding.top  + box.padding.bottom ) / 2 ) - box.top
    }
  },
  
  translate : function translate(pixels, translation) {
    var newPixels = [];
    pixels.iterate( function(pixel) {
      newPixels.push( { 
        x : pixel.x + translation.x,
        y : pixel.y + translation.y 
      } );
    } );
    return newPixels;
  },

  determineScaleFactor : function determineScaleFactor(box) {
    var mx = this.monitor.getWidth()  / 2;
    var my = this.monitor.getHeight() / 2;
    var borderX = ( box.padding.left + box.padding.right ) / 2;
    var borderY = ( box.padding.left + box.padding.right ) / 2;
    var sx = 1 + ((mx-this.getGridWidth())  - (mx-borderX)) / (mx-borderX);
    var sy = 1 + ((my-this.getGridHeight()) - (my-borderY)) / (my-borderY);
    var s = sx < sy ? sx : sy;
    return s;
  },
  
  scale : function scale(pixels, s) {
    s = s || 1;
    var mx = this.monitor.getWidth()  / 2;
    var my = this.monitor.getHeight() / 2;
    var newPixels = [];
    pixels.iterate( function( pixel ) {
      newPixels.push( { 
        x : mx + (( pixel.x - mx ) * s),
        y : my + (( pixel.y - my ) * s) 
      } );
    } );
    return newPixels;
  },
  
  drawPixels : function drawPixels(pixels, color) {
    pixels.iterate( function(pixel) {
      this.display.drawPixel( pixel, color );
    }.scope(this) );
  },
  
  drawPattern : function drawPattern(pattern, color) {
    var rowSize = this.getGridWidth();
    pattern.iterate( function( state, index ) {
      if( state === true ) {
        this.display.drawCell( { left: index % rowSize,
                                 top : Math.floor(index / rowSize) },
                               color );
      }
    }.scope(this) );
  },
  
  detectPattern : function detectPattern(pixels) {
    // detect pattern zones
    var pattern = new jsture.Pattern();
    pixels.iterate( function(pixel) {
      var x = Math.floor( pixel.x / this.getCellWidth() );
      var y = Math.floor( pixel.y / this.getCellHeight() );
      // determine index of x/y position in bitfield
      var index = y * this.getGridWidth() + x;
      pattern.set(index);
    }.scope(this) );

    // compare with known patterns
    var bestPattern, bestResult, bestScore; 
    var rowSize = this.getGridWidth();
    this.patterns.iterate( function( aPattern ) {
      var result = pattern.compareTo( aPattern, rowSize );
      if( ! bestScore || result.score <= bestScore ) { 
        bestScore   = result.score;
        bestPattern = aPattern;
        bestResult  = result;
      }
    }.scope(this) );
    this.notifyAbout( 'PatternDetected', bestPattern );
    return { recorded: pattern, result : bestResult, pattern: bestPattern };
  },

  notifyAbout : function notifyAbout( event, info ) {
    this.notifiers.iterate( function( notifier ) {
      notifier( info );
    } );
  },
  
  clear : function clear() {
    this.pixels = [];
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
