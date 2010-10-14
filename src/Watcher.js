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

    // rescale monitor to display
    var sf = ( this.display.getWidth() / this.monitor.getWidth() );
    var pixels         = this.scale(this.pixels, sf); 

    // center and scale to max of display
    var box            = this.detectBoundingBox(pixels);
    var translation    = this.determineTranslation(box);
    var scaleFactor    = this.determineScaleFactor(box);
    
    var centeredPixels = this.translate(pixels, translation);
    var cx = this.display.getWidth()  / 2;
    var cy = this.display.getHeight() / 2;
    var scaledPixels   = this.scale(centeredPixels, scaleFactor, cx, cy);

    var detected       = this.detectPattern(scaledPixels);
    
    var display = this.display;
    var width   = this.getGridWidth();
    detected.pattern.draw       ( display, "rgba(128,128,128,1)", width );
    detected.result.correct.draw( display, "rgba(0,255,0,0.3)"  , width );
    detected.result.close.draw  ( display, "rgba(255,255,0,0.3)", width );
    detected.result.wrong.draw  ( display, "rgba(255,0,0,0.3)"  , width );

    this.display.drawPixels(pixels,         "rgb(255,  0,  0)");
    this.display.drawPixels(centeredPixels, "rgb(255,255,128)");
    this.display.drawPixels(scaledPixels,   "rgb(  0,255,  0)");
    
    detected.pixels         = pixels;
    detected.centeredPixels = centeredPixels;
    detected.scaledPixels   = scaledPixels;
    
    this.notifyAbout( 'PatternDetected', detected );
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
    box.padding.bottom = this.display.getHeight() - box.bottom;
    box.padding.left   = box.left;
    box.padding.right  = this.display.getWidth() - box.right;
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
    var mx = this.display.getWidth()  / 2;
    var my = this.display.getHeight() / 2;
    var borderX = ( box.padding.left + box.padding.right  ) / 2;
    var borderY = ( box.padding.top  + box.padding.bottom ) / 2;
    var sx = 1 + ((mx-this.getGridWidth())  - (mx-borderX)) / (mx-borderX);
    var sy = 1 + ((my-this.getGridHeight()) - (my-borderY)) / (my-borderY);
    var s = sx < sy ? sx : sy;
    return s;
  },
  
  scale : function scale(pixels, s, cx, cy) {
    s  = s  || 1;
    cx = cx || 0;
    cy = cy || 0;    
    var newPixels = [];
    pixels.iterate( function( pixel ) {
      newPixels.push( { 
        x : cx + (( pixel.x - cx ) * s),
        y : cy + (( pixel.y - cy ) * s) 
      } );
    } );
    return newPixels;
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

    return { 
      recorded: pattern, 
      result  : bestResult,
      pattern : bestPattern,
      match   : bestPattern, 
      score   : bestScore 
    };
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
    return this.display.getWidth() / this.getGridWidth();
  },
  
  getGridWidth : function getGridWidth() {
    return 8; // TODO: make dynamic
  },
  
  getCellHeight : function getCellHeight() {
    return this.display.getHeight() / this.getGridHeight();
  },
  
  getGridHeight : function getGridHeight() {
    return 8; // TODO: make dynamic
  }
  
} );
