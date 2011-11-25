/* 
 * Social Feed - version: 0.1
 * https://github.com/nextdigital/socialfeed
 *
 * Copyright (c) 2011 Next Digital Group Pty Ltd
 * Licensed under the MIT license.
 * https://github.com/nextdigital/socialfeed/blob/master/LICENSE
 * 
 * Requires: jQuery 1.5+ 
 * 
 * API ( namespace: $.fn.socialfeed )
 *  .add( String name, Object service )
 *  .add( String name, String parent, Object service )
 *  .parseTime( String type, String value )
 *  .create( HTMLElement elem, Object options )
 *  .moment( Number value )
 */
(function(global) {

	var define = global.define || function( dep, fn ) { fn( global.jQuery ); };

	// The module definition in AMD format
	define(["jquery"], function( $ ){

	var module = {id:'socialfeed'},

		exports = $.fn,

		defaults = {
			service: 'twitter', // default service - available options: facebook twitter
			account: 'twitter', // default account
			firstMessageMarkerClass: 'active',
			messagesPerPage: 4,
			readMoreText: 'read more',
			loadingText: 'Loading..',
			nothingText: "Nothing",			
			totalPages: 3,
			maxCharDisplay: 140,
			pagePrevLabel: 'Prev',
			pageNextLabel: 'Next',
			pageLabel: '{0}'
		},
		
		//protocol
		protocol = document.location.protocol,
				
		//Abstract Implementation 
		masterService = {
			/*
			 * Adjusts URLs to be <a> tags
			 * TODO rewrite this method, cache RegEx and better HTML templating
			 */
			linkify: function( text, url ){
				
				var limit = this.options.maxCharDisplay;
				
				// Slice
				if( text.length > limit && url ) {
					text = text.slice(0, (text.slice(0, limit)).lastIndexOf(" ")) + '... <span class="readmore"><a href="'+url+'" target="_blank">'+this.options.readMoreText+'</a></span>';
				}
				
				// Link
				text = text.replace(/(href="|<a.*?>)?[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function($0, $1) {
					return $1 ? $0 : "<a href='"+$0+"' target='_blank'>"+$0+"</a>";
				});
				
				// BR
				return text.replace("\n","<br />");
			},
			/*
			 * Loads the resource for the feed
			 */
			load: function( finished ){
				var self = this,
					options = self.options,
					ajaxOptions = { dataType: self.xhrType || 'jsonp' };
					
				//Prepare Loading content.
				self.feed.empty().append('<li class="loading">' + options.loadingText + '</li>');
				
				//Tack URL onto
				ajaxOptions.url = $.isFunction( this.url ) ?
									this.url( options.account, options.messagesPerPage * options.totalPages, 1, options.token) : 
									this.url;

				//Fetch data with JSONP:XHR			
				fetch = $.ajax( ajaxOptions );
				
				//Success
				$.when( fetch )
					.done( function( data ) {
						finished( self, data );
					}).fail( function( data, e ) {
						finished( self, false );
					});
			},
			/*
			 * Create the list ttem
			 */
			createItem: (function(){
				var base = $('<li><div class="content"></div><div class="time"><a target="_blank"></a></div></li>');
					
				return function(text, time, url){
					var next = base.clone( true );
					next.find('.content').html( text );
					next.find('.time a').html( moment( time ) ).attr( 'href', url );
					return next;
				};
			}())
		}, 
		
		//Sub Implementations
		services = {},
		
		//Time formats that need tweaking before Date.parse()	
		timeFormats = {
			"std": [
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})([\+\-]\d{2})\:?(\d{2})$/i,
				'$4 GMT$5$6 $1/$2/$3'
			],
			"tweet": [
				/^([a-z]{3})( [a-z]{3} \d\d?)(.*)([\+\-]\d{2})\:?(\d{2})( \d{4})$/i,
				'$1,$2$6$3GMT$4$5'
			],
			"utcZ": [
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})Z$/i,
				'$4 GMT+0000 $1/$2/$3'
			]
		};
		
		/*
		 * Function for parsing time
		 */
		function parseTime( type, value ) {
			var ret;
			if( typeof value === 'undefined' ) {
				value = type;
				type = 'std';
			}
			if( value && type in timeFormats && $.type( value ) === 'string' ) {
				ret = Date.parse( value.replace.apply( value, timeFormats[type] ) );
				return ret && !isNaN( ret ) ? ret : null;
			} else {
				return null;
			}
		}
		
		/*
		 * Main method for extend services object
		 */
		function add( name, parent, service ) {
			
			// parent is optional, and therefore might actually be the service object
			if( $.isPlainObject( parent ) ) {
				service = parent;
				parent = false;
			} 
			
			// Parent needs to be the name of a service that exists
			if( $.type( parent ) === "string" && services[parent] ) {
				parent = services[parent];
			} else {
				parent = {};
			}
			
			// Can't add what you can't add.
			if( service && $.isPlainObject( service ) ) {
				services[name] = $.extend({}, masterService, parent, service);
			}
			
			return !!services[name];			
		}

		/*
		 * Simple facebook feed
		 */
		add("facebook", {
			/* Timeformat conversion 2010-11-29T05:00:00+0000 ==> 2010/11/29 05:00:00 GMT+0000 */
			time: 'std',
			map:function( obj, account ){
				var ret = [],
					self = this;
				obj.data && $.each(obj.data, function(i, fb){
					var url, text = fb.message || fb.story || fb.name;
					if ( text ) {
						url = "https://facebook.com/"+account+"/posts/"+fb.id.split("_")[1];
						ret.push({
							'id':fb.id,
							'text': self.linkify( text, url ), 
							'time': parseTime( self.time, fb.created_time ),
							'url': url
						});	
						
					}
				});
				return ret;
			},
			url: function( account, perPage, pageNo, token ){
				return "https://graph.facebook.com/"+account+"/posts?limit="+(perPage*pageNo) + (token ? "&access_token=" + token : "");
			}
		});
		
		/*
		 * Simple Twitter feed
		 */
		add("twitter", {
			/* Timeformat conversion "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 GMT+0000" */	
			time: 'tweet',
			map:function( obj, account ){
				var ret = [],
					self = this;
				
				$.each( obj.results && $.isArray(obj.results) ? obj.results : obj , function(i, tweet){
					if (tweet.text) {
						ret.push({
							'id': tweet.id,
							'text': self.linkify(tweet.text), 
							'time': parseTime( self.time, tweet.created_at ),
							'url':"http://twitter.com/"+account+"/statuses/"+tweet.id_str
						});						
					}
				});
				
				return ret;
			},
			url: function( account, perPage, pageNo ){
				return protocol  + "//api.twitter.com/1/statuses/user_timeline.json?screen_name="+account+"&count="+(perPage*pageNo)+"&trim_user=1"
			}
		});
		
		/*
		 *	Twitter Search is the same as Twitter API except url. Twitter API is recommended over search
		 */
		add( "twittersearch", "twitter", {
			url: function( query, perPage, pageNo ){
				return protocol  + "//search.twitter.com/search.json?rpp="+(perPage*pageNo)+"&q="+escape(query)+"&page=1";										
			}
		});
			
		/*
		 * Create a new instance of this module
		 */
		function create( elem, options ) {
			
			//Options
			options = $.extend( {}, defaults, options );

			var container = $(elem),
				
				feed = container.prepend('<ul class="jsf-items" />').children('.jsf-items'),
				
				// Clone an implmentation
				feedImpl =  $.isPlainObject( options.service ) ? 
								$.extend({}, masterService, options.service ) : 
								$.extend({}, services[options.service] );
					
			//Tack on options
			feedImpl.options = options;
			feedImpl.feed = feed;
			feedImpl.container = container;
			
			//Ok GO!
			feedImpl.load && feedImpl.load( feedLoaded );		
			
			return feedImpl;
		
		}
		
		
		/*
		 * The callback function for the ajax request
		 */
		function feedLoaded( feedImpl, data ) {

			//Map the data from the feed over to a feed array
			var options = feedImpl.options,
			
				speed = 'fast',
			
				feed = feedImpl.feed,
				
				container = feedImpl.container,
			
				feedArr = data && feedImpl.map( data || {}, options.account ),
			
				//New collection of list items
				feedItems = $([]),
				
				pageControls;
				
		
			//Populate the list items from the mapped data 
			$.each( feedArr, function( i, item ){
				feedItems = feedItems.add( feedImpl.createItem( item.text, item.time, item.url ) );
			});
			
			//If there is items, then lets go
			if( !!data && feedItems.length  ) {

				//Finish the loading sequence
				feed.fadeOut( speed, function() {
					
					//Clear it and Add items
					feed.empty().append( feedItems );							

					//Create pagination
					pageControls = $( pagination( options, feedItems.length ) )
					
					//Check page count
					if( pageControls ) {
						
						pageControls
						
							//Bind events
							.delegate('a', 'click', feedImpl, paginationHandler)
							
							//Stuff it into pagination
							.appendTo(container);
						
						//Init load same as 'Page 1' click
						pageControls.find('.page a:eq(0)').trigger('click');
					}

					//Show feed
					feed.show();

					//Show the box
					container.fadeIn( speed, function() {
						//Success Callback
						if( $.isFunction(options.success) ) {
							options.success.apply(container , []);
						}
					});
				
				});
			
			} else {
			
				feed.empty().append( '<li class="nothing">' + options.nothingText + '</li>' );	
				
				//Success Callback
				if( $.isFunction(options.error) ) {
					options.error.apply(container , []);
				}
				
			}			
			
		}
		
		/*
		 * Convert the time to "x days ago"
		 */
		var now = ( new Date() ).getTime();
		function moment( then ) {

			var moment, ret = "";
			
			if( then && !isNaN( then ) ) { 
				
				moment = parseInt( ( now - then ) / 1000 );
				
				if( moment < 50*60 ) {
				
					// Less than 45 seconds ago
					if(	moment < 50	) {
						ret = moment + ' seconds ago';
					// Less than 90 seconds ago
					} else if( moment < 120 ) {
						ret = 'a minute ago';
					// Less than 45 minutes ago
					} else {
						ret = parseInt(moment / 60, 10).toString() + ' minutes ago';
					}
					
				} else {
				
					// Less than 1.5 hours ago
					if( moment < ( 120 * 60 ) ) {
						ret = 'an hour ago';
					// Less than a day ago
					} else if ( moment < ( 24 * 60 * 60 ) ) {
						ret = '' + ( parseInt( moment / 3600, 10) ).toString() + ' hours ago';
					// Less than 1.5 days ago
					} else if (moment < ( 48 * 60 * 60)) {
						ret = 'a day ago';
					// Days ago
					} else {
						ret = (parseInt(moment / 86400, 10)).toString() + ' days ago';
					}
					// No months.. update your feed more.
				
				}
				ret =  'about ' + ret;
			}
			return ret;
		}
		
		/*
		 * Generate the HTML for pagination. 
		 * Not the best templating example. It's on the agenda to refactor this.
		 */
		function pagination( options, length ) {
			
			//Pages needed
			var pagesNeeded = options.totalPages = Math.ceil(length / options.messagesPerPage);
			
			//Maybe we don't need pagination
			if( pagesNeeded <= 1 ) { return; }
			
			var html = ["<ul class='jsf-pagination'>",
						"<li class='prev'>",
							"<a href='#prev'>",
								options.pagePrevLabel,
							"</a>",
						"</li>",
						(function() {
							var i, html = '', classname;
								for (var i = 1; i <= pagesNeeded; i++) {
									classname = 'page' + (i === 1 ? ' first' : (i === pagesNeeded ? ' last' : ""));
									html += ["<li class='"+classname+"'>",
												"<a href='#page"+i+"' data-pageindex='"+i+"'>",
													options.pageLabel.replace("{0}", i),
												"</a>",
											"</li>"].join('');
								}
								return html;
						}()),
						"<li class='next'>",
							"<a href='#next'>",
								options.pageNextLabel,
							,"</a>",
						"</li>",
					"</ul>"].join('');			
				
			return html;	
		}
		
		/*
		 * The event handler for the pagination controls.
		 */
		function paginationHandler(e){
			
				// The link
			var self = $(e.target),
			
				// The list item (LI)
				parent = self.parent(),
				
				//THe service implementation we are working with
				feedImpl = e.data,
				
				//The list feed
				feed = feedImpl.feed,
				
				//options
				options = feedImpl.options,

				//Current Index
				curIndex = feed.data('curIndex') || 1;

				// Max Pages
				max = options.totalPages,
				
				// link knowledge 
				disabled = parent.hasClass('disabled'),
				prev = parent.hasClass('prev'),
				
				// declare, wishful page index and Compare index to the limits
				wishindex = $(e.target).data('pageindex') || (prev ? curIndex - 1 : curIndex + 1),
				pageindex = wishindex > 0 && wishindex <= max ? wishindex : curIndex,
				
				// Range number of list items for this page
				upper = pageindex * options.messagesPerPage,
				lower = upper - options.messagesPerPage,	 
				
				//Pagination control siblings
				siblings = parent.siblings().andSelf();
			
			e.preventDefault();
				
			//Button doesn't work if it's diabled
			if( disabled ) { return ;}
			
			//Enabled/Disable/Activate the links
			siblings
				.removeClass('disabled')
				.removeClass(options.firstMessageMarkerClass)
				.each(function(i) {
					if( siblings.eq(i).children('a').data('pageindex') ===  pageindex) {
						siblings.eq(i).addClass('active');
					}				
				});

			//Enabled/Disable/Activate the links
			if(pageindex === 1 || pageindex === max) {
				siblings.filter(pageindex === 1 ? '.prev' : '.next').addClass('disabled');
			}
			
			//Turn the Page
			feed.children().hide().filter( function( index ) {
				return index < upper && index >= lower;
			}).show();			
			
			//Store current page index
			feed.data('curIndex', pageindex);
		}
		
		// Almost Finished.. Let's wrap it up!
		
		// The plugin init function
		function pluginInit( options ) {
			this.length && this.each( function( i, elem ) {
				var elem = $( elem )
					widget = elem.data( module.id );
				
				if( !widget ) {
					elem.data( module.id , create( elem, options ) );
				} else {
					// Future versions will have options on an existing widget
					// eg. .socialfeed('destroy');
				}
			});
			return this;
		};

		// Export the plugin
		exports[module.id] = pluginInit;

		// Export the API methods and defaults
		$.extend( exports[module.id], {
			defaults: defaults,
			add: add,
			create: create,
			moment: moment,
			parseTime: parseTime
		});
		
	}); // end define call

}(this)); // end closure