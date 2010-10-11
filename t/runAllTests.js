load( "lib/ProtoJS/lib/env.rhino.js" );
load( "build/jsture.min.js" );

[ 
  "Pattern"
].iterate( function( unit ) {
	load( "t/test" + unit + ".js"    );	
} );

function showResults(tester) {
	print( "-----------------------" );
	print( tester.getResults().total   + " tests run." );
	print( tester.getResults().failed  + " failed." );
	print();
}

ProtoJS.Test.Runner.on( "ready", showResults );
ProtoJS.Test.Runner.start();
