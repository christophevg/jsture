jsture.Pattern = Class.extend( {

  init : function init( name, zones, bits ) {
    this.name  = name  || "";
    this.zones = zones || [];
    this.bits  = bits  || 32;  // 32 bits by default (max for Number)
  },
  
  getName : function getName() {
    return this.name;
  },

  set : function set(index) {
    var position = this.getPosition(index);
    this.zones[position.zone] |= 1 << position.offset;
  },
  
  get : function get(index) {
    var position = this.getPosition(index);
    var bit = 1 << position.offset;
    return ( this.zones[position.zone] & bit ) == bit;
  },

  getPosition : function getZoneOf(index) {
    return { 
      zone   : Math.floor( index / this.bits ),
      offset : index % this.bits
    };
  },

  iterate : function iteratePattern( handler, context ) {
    for( var zone=0; zone < this.zones.length; zone++ ) {
      for( var bit=0; bit < this.bits; bit++ ) {
        var index = ( zone * this.bits ) + bit;
        handler.call( context, this.get(index), index );
      }
    }
  },

  toHex : function toHex() {
    // encode pattern
    var hex = [];
    this.zones.iterate( function(part, i) {
      hex.push( ('00000000' + new Number(isNaN(part) ? 0 : part).toHex())
                .slice(-8) );
    } );
    return hex.join('-');
  },
  
  toString : function toString() {
    return this.toHex();
  },
  
  compareTo : function compareTo( otherPattern, rowSize ) {
    var result = { 
      score   : 0, 
      correct : new jsture.Pattern(), 
      wrong   : new jsture.Pattern(), 
      close   : new jsture.Pattern() 
    };
    this.iterate( function( state, i ) {
      var expected = otherPattern.get(i); 
      if( expected === true ) {
        if( state === true  ) {
          // correct
          result.correct.set(i);
        } else {
          if( this.hasAdjectantCell( i, rowSize ) ) {
            // correct one close by
            result.close.set(i);
            result.score += 0.5;
          } else {
            // wrong
            result.wrong.set(i);
            result.score += 1;
          }
        }
      } else {
        if( state === true ) {
          if( otherPattern.hasAdjectantCell( i, rowSize ) ) {
            // close to a correct one
            result.close.set(i);
            result.score += 0.5;
          } else {
            // wrong
            result.wrong.set(i);
            result.score += 1;
          }
        }
      }
    }.scope(this) ); 

    return result;
  },
  
  hasAdjectantCell: function hasAdjectantCell( index, rowSize ) {
    var rowIndex = index % rowSize;
    var row      = Math.floor( index / rowSize );

    // TODO: clean this up ;-)
    // TODO: move more boundary violations to get()

    // n
    if( row > 0 && this.get( index - rowSize ) ) { return true; }
    // ne
    if( row > 0 && rowIndex < rowSize - 1 && 
        this.get( index - rowSize + 1 ) ) { return true; }
    // e
    if( rowIndex < rowSize - 1 && this.get( index + 1 ) ) { return true; }
    // se
    if( rowIndex < rowSize - 1 && this.get( index + rowSize + 1 ) ) { return true; }
    // s
    if( this.get( index + rowSize ) ) { return true; }
    // sw
    if( rowIndex > 0 && this.get( index + rowSize - 1 ) ) { return true; }    
    // w
    if( rowIndex > 0 && this.get( index - 1 ) ) { return true; }
    // nw
    if( row > 0 && rowIndex > 0 && this.get( index - rowSize - 1 ) ) { return true; }

    return false;
  },
  
  draw : function drawPattern(display, color, rowSize) {
    this.iterate( function( state, index ) {
      if( state === true ) {
        display.drawCell( { left: index % rowSize,
                            top : Math.floor(index / rowSize) },
                          color );
      }
    } );
  },

  
} );

jsture.Pattern.fromString = function( name, string ) {
  name   = name   || "";
  string = string || "";

  var zones = [];
  string.split('-').iterate( function(part) { 
    zones.push( parseInt( part, 16 ) ); 
  } );
  return new jsture.Pattern(name, zones);
};
