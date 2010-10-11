ProtoJS.Test.Runner.addTestUnit( 

	ProtoJS.Test.extend( {
		getScope: function() { return "Pattern"; },

		test001toString: function() {
		  var pattern = jsture.Pattern.fromString( 'name', '1A3B5C7D-FF0011EE' );
      this.assertEqual( pattern.toString(), '1A3B5C7D-FF0011EE' );
		}
	} )
	
);
