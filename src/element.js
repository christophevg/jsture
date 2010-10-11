jsture.Element = Class.extend( {
  
  init : function init(element) {
    this.element = element;
    this.setupMouseEventHandlers();
  },

  setupMouseEventHandlers: function setupMouseEventHandlers() {
    ProtoJS.Event.observe(this.element, 'mousedown', 
                          this.handleMouseDown.scope(this));
    ProtoJS.Event.observe(this.element, 'mouseup', 
                          this.handleMouseUp.scope(this));
    ProtoJS.Event.observe(document, 'mousemove', 
                          this.handleMouseMove.scope(this));
  },
  
  getWidth : function getWith() {
    return this.element.offsetWidth;
  },
  
  getHeight : function getHeight() {
    return this.element.offsetHeight;    
  },

  getLeft: function getLeft() {
    var elem = this.element;
    var left = 0;
    while( elem != null ) {
      left += elem.offsetLeft;
      elem = elem.offsetParent;
    }
    return left;
  },

  getTop : function getTop() {
    var elem = this.element;
    var top = 0;
    while( elem != null ) {
      top += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return top;
  },

  getXY: function getXY(e) {
    var x,y;
    if( ProtoJS.Browser.IE ) {
      x = event.clientX + document.body.scrollLeft;
      y = event.clientY + document.body.scrollTop;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    return { x: x - this.getLeft(), y: y - this.getTop() };
  },

  handleMouseDown: function handleMouseDown(event) {
    this.mousepressed = true;
    var pos = this.getXY(event);
    this.fireEvent( "mousedown", pos );
    this.mousePos = pos;
  },

  handleMouseUp: function handleMouseUp(event) {
    this.mousepressed = false;
    var pos = this.getXY(event);
    this.fireEvent( "mouseup", pos );
    this.mousePos = pos;
  },

  handleMouseMove: function handleMouseMove(event) {
    if( this.mousepressed ) { this.handleMouseDrag(event); }
    var pos = this.getXY(event);
    if( pos ) {
      var mouseWasOver = this.mouseOver;
      this.mouseOver = ( pos.x >= 0 && pos.x <= this.getWidth() ) &&  
                       ( pos.y >= 0 && pos.y <= this.getHeight() );
      if(this.mouseOver && !mouseWasOver) { this.fireEvent( "mouseEnter" );}
      if(!this.mouseOver && mouseWasOver) { this.fireEvent( "mouseLeave" );}
    }
  },

  handleMouseDrag: function handleMouseDrag(event) {
    var pos = this.getXY(event);
    this.fireEvent( "mousedrag", { 
      x: pos.x, 
      y: pos.y, 
      dx: pos.x - this.mousePos.x,
      dy: pos.y - this.mousePos.y 
    } );
    this.mousePos = pos;
  }
  
} );

ProtoJS.mix( ProtoJS.Event.Handling, jsture.Element.prototype );
