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
  
  compareTo : function compareTo( otherPattern ) {
    var score = 0;
    this.iterate( function( state, i ) {
      score += state !== otherPattern.get(i) ? 1 : 0;
    } ); 
    return score;
  }
  
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
