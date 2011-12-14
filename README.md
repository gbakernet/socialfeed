Social Feed
=================

Social Feed is a jQuery plugin that will display live feed updates, in a small widget.
The strategy with this plugin is to make it easy to use any simple JSON web service to retrieve content. 

The plugin comes with three service implementations by default. They are the real Facebook Graph API (User Posts), the real Twitter API (User Timeline) and the real Twitter Search API. 
It doesn't use YQL (which is cool) or vendor JavaScript SDKs (which are cool). 
Extending to use YQL is easily through the `$.fn.socialfeed.add()` interface.

Demo http://nextdigital.github.com/socialfeed


Usage
-----

Initialising the social feed is easy.

Twitter Example

``` js
$('#feed').socialfeed({
	service: "twitter",
	account: "twitter"
});
```

Twitter Search Example

``` js
$('#feed').socialfeed({
	service: "twittersearch",
	account: "#cats"
});
```

Facebook Example ( needs the access token )

``` js
$('#feed').socialfeed({
	service: "facebook",
	account: "facebook",
	token: "OAuthTokenGoesHere"
});
```

Advanced Facebook Example

``` js
$('#feed').socialfeed({
	service: 'facebook',
	account: 'facebook',
	token: 'OAuthTokenGoesHere',
	messagesPerPage: 4,
	totalPages: 3,
	maxCharDisplay: 100,
	readMoreText: 'more',
	loadingText: 'Magic happening..',
	nothingText: "No results!",			
	success:  function() {
		// Success
	},
	error:  function() {
		// Error
	}
});
```

Don't want pagination. Easy!

``` js
$('#feed').socialfeed({
	service: "twitter",
	account: "twitter"
	// Pagination is omitted if there is only one page!
	totalPages: 1,
	messagesPerPage: 10,
});
```


API
----------

Social Feed is extensible in a sense that you can display any feed. It is not limited to Facebook and Twitter.

+ **add** - `$.fn.socialfeed.add( serviceName, serviceParentName?, implementation )`
This will add a service implementation to the plugin core. It can be used with the option `service`. **Use trusted sources as, it doesn't yet strip any html from the feeds**

An example

``` js
$.fn.socialfeed.add("flickr", {
	/*
	 * Map returns an array of objects with id, text, time and a url.
	 */
	map: function( data ){
		var ret = [];
		data.items && $.each( data.items, function( index, item ){
			if ( item.title ) {
				ret.push({
					'id': index,
					'text': '<img src="' + item.media.m + '" />',
					'time': $.fn.socialfeed.parseTime( "utcZ", item.published ),
					'url': item.url
				});				
			}
		});
		return ret;
	},
	/*
	 * Return the url for the feed.
	 */
	url: function( searchTerm ){
		return "http://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=?&tags=" + searchTerm;
	}
});
```

An inheritance example, creating a feed service for Twitter Retweets based on the original Twitter service

``` js
$.fn.socialfeed.add("twitter-retweets", "twitter", {
	url: function( account, perPage, pageNo ){
		return "//api.twitter.com/1/statuses/retweeted_by_user.json?screen_name="+account+"&count="+(perPage*pageNo)+"&trim_user=1"
	}
});
```

+ **parseTime** - `$.fn.socialfeed.add( type?, timeString )`
A helper function for parsing the time strings

+ **moment** - `$.fn.socialfeed.moment( timeValue )`
A helper function for creating descriptive time, eg. "about 1 second ago"

+ **create** - `$.fn.socialfeed.create( HTMLElement, options )`
The same factory function used by the `fn` plugin function


AMD
---

This plugin will `define()` itself as per the AMD module spec.


Bug tracker
-----------

Have a bug? Please create an issue here on GitHub, pull requests welcome!

https://github.com/nextdigital/socialfeed/issues


Authors
-------

**Glenn Baker**

+ http://github.com/gbakernet

Thanks to **Dave Bui** for his early contribution to this project.


License
---------------------

Copyright (c) 2011 Next Digital Group Pty Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


