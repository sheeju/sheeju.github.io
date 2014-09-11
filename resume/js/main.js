/*

	Copyright (c) - All rights reserved.
	Distributed under the GNU General Public Licence, Version 3.
	(See accompanying file COPYING or copy at http://www.gnu.org/licenses/gpl-3.0.txt)

 	by santana-jorge

 */

$(function() {

	'use strict';

	$('#to-top').on('click', function(event) {
		event.preventDefault();
		$('html, body').animate({scrollTop:0}, 'slow'); 		
	});

	$("[data-toggle='tooltip']").tooltip();

	if (typeof console === "undefined") {
	    console = {
	        log: function() { }
	    };
	}

	console.log("Ready");
});
