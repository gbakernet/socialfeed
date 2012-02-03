$(document).ready(function(){
	
	module("socialfeed");

	mock();		
	
	test("Namespace", function() {

		ok( $.isFunction( $.fn.socialfeed ),"$.fn.socialfeed" );
		ok( $.isFunction( $.fn.socialfeed.add ), "$.fn.socialfeed.add" );
		ok( $.isFunction( $.fn.socialfeed.create ), "$.fn.socialfeed.create" );
		ok( $.isFunction( $.fn.socialfeed.moment ), "$.fn.socialfeed.moment" );
		ok( $.isPlainObject( $.fn.socialfeed.defaults ), "$.fn.socialfeed.defaults" );
		ok( !$.fn.socialfeed.services, "No services on the namespace" );
		ok( !window.services, "services specifically didn't leak to the global scope" );
	
	});
	
	test(".add()", function() {
		
		// Add Services
		ok( !$.fn.socialfeed.add("alpha"), "Can't pass single string");
		ok( !$.fn.socialfeed.add({}), "Can't pass single object");
		ok( $.fn.socialfeed.add("alpha", {}), "Can pass String Name, Object Service");
		ok( $.fn.socialfeed.add("beta", "alpha", {}), "Can pass String Name, String Parent Name, Object Service");
		ok( $.fn.socialfeed.add("alpha", {}, {}), "Can pass String Name, Object Service, second object ignored");
		ok( !$.fn.socialfeed.add({}, "alpha"), "Can't pass Service then Name");
		
	});
	
	test(".parseTime()", function() {
	
		// Bad
		equals( $.fn.socialfeed.parseTime("kjslfkasjdf"), undefined ,"Bad Time" )
		equals( $.fn.socialfeed.parseTime( {} ), undefined ,"Bad Time" )
		
		// Good - Facebook
		equals( $.fn.socialfeed.parseTime("2011-11-11T07:39:06+0000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +0 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T07:39:06+00:00"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +0 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T17:39:06+1000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +10 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T17:39:06+10:00"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +10 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T07:39:06-0000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -0 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T07:39:06-00:00"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -0 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T08:39:06+0100"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +1 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-11T08:39:06+01:00"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +1 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-10T21:39:06-1000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -10 Hours" )
		equals( $.fn.socialfeed.parseTime("2011-11-10T21:39:06-10:00"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -10 Hours" )

		// Good - Facebook
		equals( $.fn.socialfeed.parseTime('std',"2011-11-11T07:39:06+0000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +0 Hours" )
		equals( $.fn.socialfeed.parseTime('std',"2011-11-11T17:39:06+1000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +10 Hours" )
		equals( $.fn.socialfeed.parseTime('std',"2011-11-11T07:39:06-0000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -0 Hours" )
		equals( $.fn.socialfeed.parseTime('std',"2011-11-11T08:39:06+0100"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT +1 Hours" )
		equals( $.fn.socialfeed.parseTime('std',"2011-11-10T21:39:06-1000"), Date.parse("07:39:06 GMT+0000 2011/11/11") ,"Time @ GMT -10 Hours" )

		// Good - Twitter
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 07:34:56 +0000 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +0 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 07:34:56 +00:00 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +0 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 17:34:56 +1000 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +10 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 17:34:56 +10:00 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +10 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 07:34:56 -0000 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT -0 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 07:34:56 -00:00 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT -0 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 08:34:56 +0100 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +1 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Mon Nov 21 08:34:56 +01:00 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT +1 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Sun Nov 20 21:34:56 -1000 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT -10 Hours" )
		equals( $.fn.socialfeed.parseTime('tweet',"Sun Nov 20 21:34:56 -10:00 2011"), Date.parse("07:34:56 GMT+0000 2011/11/21") ,"Time @ GMT -10 Hours" )
		
		// utcZ
		

		
	});
	
	test(".moment()", function() {
	
		// New time.
		var time = (new Date()).getTime() - 1e3;
		
		equals( $.fn.socialfeed.moment( time -   1e3 ) , 'about 1 seconds ago', "1 second");
		equals( $.fn.socialfeed.moment( time -   4e3 ) , 'about 4 seconds ago', "4 seconds");
		equals( $.fn.socialfeed.moment( time -  49e3 ) , 'about 49 seconds ago', "49 seconds");
		equals( $.fn.socialfeed.moment( time -  50e3 ) , 'about a minute ago', "50 seconds");
		equals( $.fn.socialfeed.moment( time -  51e3 ) , 'about a minute ago', "51 seconds");
		equals( $.fn.socialfeed.moment( time -  60e3 ) , 'about a minute ago', "60 seconds");
		equals( $.fn.socialfeed.moment( time -  89e3 ) , 'about a minute ago', "89 seconds");
		equals( $.fn.socialfeed.moment( time - 119e3 ) , 'about a minute ago', "119 seconds");
		
		equals( $.fn.socialfeed.moment( time -  2*6e4 ) , 'about 2 minutes ago', "2 minutes");
		equals( $.fn.socialfeed.moment( time - 24*6e4 ) , 'about 24 minutes ago', "24 minutes");
		equals( $.fn.socialfeed.moment( time - 49*6e4 ) , 'about 49 minutes ago', "49 minutes");
		equals( $.fn.socialfeed.moment( time - 50*6e4 ) , 'about an hour ago', "50 minutes");
		equals( $.fn.socialfeed.moment( time - 51*6e4 ) , 'about an hour ago', "51 minutes");
		equals( $.fn.socialfeed.moment( time - 60*6e4 ) , 'about an hour ago', "51 minutes");
		equals( $.fn.socialfeed.moment( time - 119*6e4 ) , 'about an hour ago', "119 mintues");
		
		equals( $.fn.socialfeed.moment( time - 2*60*6e4 ) , 'about 2 hours ago', "2 hours");
		equals( $.fn.socialfeed.moment( time - 5*60*6e4 ) , 'about 5 hours ago', "5 hours");
		equals( $.fn.socialfeed.moment( time - 17*60*6e4 ) , 'about 17 hours ago', "17 hours");
		equals( $.fn.socialfeed.moment( time - 23*60*6e4 ) , 'about 23 hours ago', "23 hours");
		equals( $.fn.socialfeed.moment( time - 24*60*6e4 ) , 'about a day ago', "24 hours");

		equals( $.fn.socialfeed.moment( time - 2*24*60*6e4 ) , 'about 2 days ago', "2 days");
		equals( $.fn.socialfeed.moment( time - 58*24*60*6e4 ) , 'about 58 days ago', "58 hours");
		equals( $.fn.socialfeed.moment( time - 1458*24*60*6e4 ) , 'about 1458 days ago', "1458 hours");

		equals( $.fn.socialfeed.moment() , "", "Undefined");
		equals( $.fn.socialfeed.moment( "" ) , "", "Empty");
	
		
	});

		
	test("Plugin - Test 1", function() {
		expect(5);
		var social1 = $('#social1');
		currentMockData = [
			{
				"id": 1,
				"text": "Lorem Ipsum",
				"time": "",
				"url": "http://www.example.com/link1"
			},{
				"id": 2,
				"text": "Lorem Ipsum",
				"time": "",
				"url": "http://www.example.com/link2"
			}
		];
		social1.socialfeed();
		stop();
		setTimeout( function() {
			equals( social1.selector, '#social1', "returns this");
			ok( social1.data("socialfeed"), "socialfeed widget in the data attr");
			equals( social1.find('.jsf-items > li').length, 2, "There are items in the feed" );
			equals( social1.find('.jsf-items > :visible').length, 2, "The first 2 are visible is length" );
			equals( social1.find('.jsf-pagination li').length, 0, "No Pagination required" );
			start();
		}, 3e2 );
	});

	test("Plugin - Test 2", function() {
		expect(9);
		var social2 = $('#social2');		
		stop();
		social2.socialfeed({
			service: "mockAjax",			
			success: function() {				
				equals( social2.selector, '#social2', "returns this");
				equals( social2.find('.jsf-items > li').length, 6, "There are items in the feed" );
				equals( social2.find('.jsf-items > li:lt(4):visible').length, 4, "The first 4 are visible is length" );
				equals( social2.find('.jsf-pagination .prev').length, 1, "Prev" );
				equals( social2.find('.jsf-pagination .page').length, 2, "2 Pages" );
				equals( social2.find('.jsf-pagination .page.first.active').length, 1, "First page is active" );
				equals( social2.find('.jsf-pagination .next').length, 1,"Next" );				
				social2.find('.jsf-pagination .page:eq(1) a').trigger('click');
				setTimeout( function() {
					equals( social2.find('.jsf-pagination .page.last.active').length, 1 , "Second page now is active" );
					equals( social2.find('.jsf-items > li:gt(3):visible').length, 2, "There last 2 are visible" );
					start();
				}, 1e2 );
			}
		});
	});
	
	test("Plugin - Test 3", function() {
		expect(2);
		var social3 = $('#social3');		
		stop();
		social3.socialfeed({
			service: "mockAjax",
			success: function() {				
				equals( social3.selector, '#social3', "returns this");
				equals( social3.find('.jsf-items > li').length, 6, "There is length" );
				start();
			}
		});		
	});
	
	test("Plugin - Test 4", function() {
		expect(2);
		var social4 = $('#social4');		
		stop();
		social4.socialfeed({
			service: "mockDataFail",			
			error: function() {				
				equals( social4.selector, '#social4', "returns this");
				equals( social4.find('.jsf-items > .nothing').length, 1, "No results message" );				
				start();
			}
		});		
	});

	// TODO - cache tests
		
	function mock() {
		$.fn.socialfeed.defaults.cacheTimeout = 0 // No cache by default
		
		$.fn.socialfeed.add("mockAjax", {
			xhrType: "json",
			url: "static/local.js?" + (new Date).getTime(),
			map: function( obj ) {
				return obj.arr;
			}
		});
		$.fn.socialfeed.add("mockData", {
			load: function( finished ) {
				finished( this, currentMockData );
			},
			map: function( obj ) {
				return obj;
			}
		});
		$.fn.socialfeed.add("mockDataFail", {
			load: function( finished ) {
				finished( this, false );
			},
			map: function( obj ) {
				return obj;
			}
		});		
		//Override twitter for the case of no service provided
		$.fn.socialfeed.add("twitter", "mockData", {});
	}

});