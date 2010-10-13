jsture.Display = Class.extend( {   

  init : function init( canvas ) {
    // overloaded constructor implementation allows the passing of an id
    if( typeof canvas == "string" ) {
      canvas = document.getElementById(canvas);
    }

    if( ! canvas || ! canvas.getContext ) {
      throw "Unknown Canvas.";
    }
    
    this.element = canvas;
    this.canvas  = canvas.getContext('2d');
  },
  
  setGridWidth : function setGridWidth(width) {
    this.gridWidth = width;
    return this;
  },
  
  getGridWidth : function getGridWidth() {
    return this.gridWidth || this.getWidth();
  },
  
  setGridHeight : function setGridHeight(height) {
    this.gridHeight = height;
    return this;
  },
  
  getGridHeight : function getGridHeight() {
    return this.gridHeight || this.getHeight();
  },

  getWidth : function getWidth() {
    return this.element.width;
  },

  getHeight : function getHeight() {
    return this.element.height;
  },
  
  clear : function clear() {
    this.canvas.clearRect(0, 0, this.element.width, this.element.height);
  },
  
  applyGrid : function applyGrid( width, height ) {
    this.gridWidth  = width;
    this.gridHeight = height;
  },
  
  drawPixels : function drawPixels( pixels, color ) {
    
    pixels.iterate( function(pixel) { 
      this.drawPixel(pixel, color); 
    }.scope(this) );
  },
  
  drawPixel : function drawPixel( pixel, color ) {
    this.canvas.fillStyle = color || "black";
    this.canvas.fillRect( pixel.x-1, pixel.y-1,2,2);
  },

  drawCells : function drawCells( cells, color ) {
    cells.iterate( function(cell) { 
      this.drawCell(cell, color); 
    }.scope(this) );
  },
  
  drawCell : function drawCell( cell, color ) {
    this.canvas.fillStyle = color || "rgb(200,200,200);";
    var cellWidth = this.getCellWidth();
    var cellHeight = this.getCellHeight();
    this.canvas.fillRect( cell.left * cellWidth, cell.top * cellHeight,
                          cellWidth, cellHeight );
  },
  
  getCellWidth : function getCellWidth() {
    return this.getWidth() / this.getGridWidth();
  },

  getCellHeight : function getCellHeight() {
    return this.getHeight() / this.getGridHeight();
  },

} );
