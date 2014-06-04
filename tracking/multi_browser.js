// A collection of frequently used functions which differ in the different browsers.

addListener = typeof window.addEventListener !== "undefined" ? (
        function(element, event, fn) {
            element.addEventListener( event, fn );
        }
) : (
        function(element, event, fn) {
            element.attachEvent( "on" + event, fn );
        }
);

removeListener = typeof window.removeEventListener !== "undefined" ? (
        function(element, event, fn) {
            element.removeEventListener( event, fn );
        }
) : (
        function(element, event, fn) {
            element.detachEvent( "on" + event, fn );
        }
);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;