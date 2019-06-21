# Nik's Crappy Pardot Scripts

Due to Pardot's reliance on horrible technology, I have to use some scripts to make life better. These are free for anyone to use and probably have application beyond Pardot.

# easyFrame.js

This script leverages [David Bradshaw's iframeResizer library](https://github.com/davidjbradshaw/iframe-resizer) to easily create resized iframes that suck less than usual, as follows:

- The script loads the frame based on a frame within a <noscript> tag, so there's no complex HTML
- The frame will load with an "origin" variable that is the hosting page, making it possible to capture what pageview actually created the page
- All URL query variables will be passed to the frame, so your utm_ tags and other tracking variables are maintained
- If there is a "gclid" set in a first-party cookie or from the URL, it will be passed to the frame as well for proper ad tracking
- The iframeResizer.js script will be loaded asynchronously to ensure quickest possible page response
- Browsers without JavaScript support will load the frame in the <noscript> as per usual

USAGE

Create your frame within a <noscript> tag that has the class "ns-responsive-frame". It's fine if there is other markup within your noscript tag and if there's any styling or attributes on the <iframe> tag itself - these will (mostly) be maintained.

Add the script anywhere on the page after the <noscript> close tag. (Much of it is asynchronous, so it shouldn't slow down page load if it's before the end, and that will ensure the frame loads sooner.)

This script will not run on multiple frames - only the first noscript.ns-responsive-frame will be affected.

EXAMPLE:

`<noscript class="ns-responsive-frame">
<iframe src="https://www.other-domain.com/contentpage.html" width="100%" height="500" type="text/html" frameborder="0" allowTransparency="true" style="border: 0;"></iframe>
</noscript>

<script type="text/javascript" src="easyFrame.js"></script>`

You will also need to add the iframe content window script before the closing <body> tag 
on the iframe-embedded page:

`<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.1.1/iframeResizer.contentWindow.min.js"></script>`

For more help with the iframeResizer script and its options: https://github.com/davidjbradshaw/iframe-resizer
