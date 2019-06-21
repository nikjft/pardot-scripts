/*********************************
 *                               *
 *  NIK'S CRAPPY IFRAME RESIZER  *
 *                               *
 **********************************/

/*

This script leverages the iframeResizer library to easily create resized iframes
that suck less than usual, as follows:

- The script loads the frame based on a frame within a <noscript> tag, so there's no complex HTML
- The frame will load with an "origin" variable that is the hosting page, making it possible to capture what pageview actually created the page
- All URL query variables will be passed to the frame, so your utm_ tags and other tracking variables are maintained
- If there is a "gclid" set in a first-party cookie or from the URL, it will be passed to the frame as well for proper ad tracking
- The iframeResizer.js script will be loaded asynchronously to ensure quickest possible page response
- Browsers without JavaScript support will load the frame in the <noscript> as per usual

USAGE

Create your frame within a <noscript> tag that has the class "ns-responsive-frame".
It's fine if there is other markup within your noscript tag and if there's any styling 
or attributes on the <iframe> tag itself - these will (mostly) be maintained.

Add the script anywhere on the page after the <noscript> close tag. 
(Much of it is asynchronous, so it shouldn't slow down page load if it's before the end, 
and that will ensure the frame loads sooner.)

This script will not run on multiple frames - only the first noscript.ns-responsive-frame will be affected.

EXAMPLE:

<noscript class="ns-responsive-frame">
<iframe src="https://www.other-domain.com/contentpage.html" width="100%" height="500" type="text/html" frameborder="0" allowTransparency="true" style="border: 0;"></iframe>
</noscript>

<script type="text/javascript" src="easyFrame.js"></script>


You will also need to add the iframe content window script before the closing <body> tag 
on the iframe-embedded page:

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.1.1/iframeResizer.contentWindow.min.js"></script>

For more help with the iframeResizer script and its options: https://github.com/davidjbradshaw/iframe-resizer

*/

function loadAsync(src, callback, relative) {
	//console.log('loadAsync(' + src + ')');
	var baseUrl = "/resources/script/";
	var script = document.createElement('script');
	if (relative === true) {
		script.src = baseUrl + src;
	} else {
		script.src = src;
	}

	if (callback !== null) {
		if (script.readyState) { // IE, incl. IE9
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else {
			script.onload = function () { // Other browsers
				callback();
			};
		}
	}
	document.getElementsByTagName('head')[0].appendChild(script);
}

// Get GCLID + helper functions
function getGclid() {

	var gclid;

	function getCookieValue(a) {
		var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
		return b ? b.pop() : '';
	}

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	var gclidCookie = getCookieValue('gclid');
	var gclidUrlArg = getParameterByName('gclid', window.location.href);

	if (localStorage.getItem('gclid')) {
		gclid = localStorage.getItem('gclid');
	} else if (gclidCookie) {
		gclid = gclidCookie;
		document.cookie = "gclid=" + gclid + ";expires=" + new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 365).toGMTString() + ";path=/";
		if (window['Storage']) {
			localStorage.setItem('gclid', gclid);
		}

	} else if (gclidUrlArg) {
		gclid = gclidUrlArg;
	}
	/* Save gclid for later */

	if (gclid) {
		if (window['Storage']) {
			localStorage.setItem('gclid', gclid);
		}
		document.cookie = "gclid=" + gclid + ";expires=" + new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 365).toGMTString() + ";path=/";

		return gclid;
	}
}; // end getGclid()




function initFrame() {
	console.log('Creating frame');
	// var frameURL = new URL(frameSrc);
	// Pull frame out of <noscript> tag with ".ns-responsive.frame" class

	ns = document.querySelector('noscript.ns-responsive-frame');
	fs = ns.innerHTML.match(/<iframe.+<\/iframe>/i)[0];
	fn = document.createRange().createContextualFragment(fs).firstChild;

	try {
		var frameBase = fn.src.match(/^[^&?]+/)[0];
		console.log('Base: ' + frameBase);
	} catch (e) { };

	try {
		var frameSearch = fn.src.match(/\?(.+)$/)[1];
		console.log('Search: ' + frameSearch);
	} catch (e) { var frameSearch = null }
	var frameSrcUrl = frameBase;
	var frameParams = "origin=" + encodeURIComponent(window.location.origin);

	if (window.location.search) {
		frameParams += window.location.search
	}

	if (frameSearch) {
		frameParams += '&' + frameSearch;
	}


	if (getGclid()) {
		frameParams = frameParams.replace(/[&?]gclid=[^&?]+/ig, '');
		frameParams += '&gclid=' + getGclid();
	}

	fn.src = frameBase + '?';
	fn.src += frameParams.replace('?', '&');


	fn.classList.add('resizerFrame');

	fn.scrolling = "no";
	fn.frameBorder = 0;
	fn.width = "100%";
	fn.height = "500px";
	fn.allowTransparency = 'true';
	fn.style.width = '1px';
	fn.style.minWidth = '100%';
	fn.style.overflow = 'hidden';
	fn.style.border = '0px';
	fn.style.height = '500px';

	ns.insertAdjacentElement('afterend', fn);


	fn.onload = function () {
		loadAsync('https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.1.1/iframeResizer.min.js', function () { iFrameResize({ log: false }, '.resizerFrame'); }, false)
	};

};

initFrame();
