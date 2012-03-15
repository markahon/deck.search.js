/**
 * Search feature for deck.js jQuery-plugin (http://imakewebthings.com/deck.js/).
 * @author markahon@github
 */
(function($, deck) {
	var $d = $(document), $cont;


	/* Default settings. */
	var defaults = {
		useGo: false,
		container : {
			id: 'ds_container',
			style: {
				position: 'fixed',
				top: 0,
				/* top right corner would be nicer, but it messes up the $.deck display */
				left: 0,
				background: '#fff',
				border: '1px solid black',
				padding: '1em',
				'z-index': '10'
			}
		},
		input : {
			id: 'ds_input',
			hint: "Press ' f ' to search"
		},
		results : {
			id: 'ds_results',
			hitsStyle: 'font-style: italic; font-size: 80%; color: #888;'
		},
		keys : {
			focusSearch: 70, // f
			blurSearch : 27, // esc
			navigateToResult : 13 // enter
		}
	};


    /*
	  Remove the search box.
	*/
	function removeSearch() {
		$d.unbind('.decksearch');
		if ($cont) {
			$cont.remove();
		}
		$('#'+defaults.container.id).remove();
	}


	/*
	  Show the search box.
	*/
	function showSearch(options) {
		var $input, $results;
		
		var settings = $.extend({}, defaults, options);
	
		/* Remove any previous instances and re-initialize, if running this function again for some reason. */
		removeSearch();


		/* Init container. */
		$cont = $('<div id="'+settings.container.id+'" />').css(settings.container.style);


		/* Init search box. */
		$input = $('<input id="'+settings.input.id+'" type="search" results="5" autocomplete="on" placeholder="'+settings.input.hint+'" />')
			/* Handle events related to search-field. */
			.bind('keyup keydown keypress', function(event) {
				/* Stop event propagation from the search box not to get mixed with normal deck navigation. */
				event.stopPropagation();
				
				/* Work only on keyup events */
				if (event.type !== 'keyup') {
					return;
				}
				
				/* Search and display results */
				var searchString = $(this).val();
				var links = [];
				if (searchString.length) {	
					var regex = new RegExp(searchString, 'img');
					$('.slide').each(function(i,n) {
						var hits = $(this).text().match(regex);
						if (hits) {
							links.push([
								'<a id="result', i , '" href="#', this.id ,'">', 'Jump to #', this.id , '</a> ',
								'<span style="',settings.results.hitsStyle,'">(', hits.length, ' hit', (hits.length > 1 ? 's' : ''), ')</span>',
								'<br>'
								].join('')
							);
						}
					});
				}
				$results.html(links.join(''));

				/* Navigate to first search result. (Default = ENTER) */
				var key = event.keyCode || event.which;
				if (key === settings.keys.navigateToResult) {
				  $results.find('a:first').click();
				}
				
				/* Blur the search field to allow normal keyboard navigation. (Default = ESC) */
				else if (key === settings.keys.blurSearch) {
				  $(this).blur();
				}
			})
			/* Empty results, when the "empty this input" -icon in search field is clicked. */
			.bind('click', function() {
				if (!$(this).val().length) {
					$results.empty();
				}
			})
			.bind('focus', function() {
				$(this).removeAttr('placeholder');
			})
			.bind('blur', function() {
				$(this).attr('placeholder', settings.input.hint);
			})
			.appendTo($cont);


		/* Focus search field. (Default = f) */
		$d.bind('keyup.decksearch', function() {
			var key = event.keyCode || event.which;
			if (key === settings.keys.focusSearch) {
				$input.focus();
			}
		});
		


		/* Init results list. */
		$results = $('<div id="'+settings.results.id+'" />')
			// Navigate the deck when clicking on result-link using the deck.core 'go'-function.
			// It seems, that without 'go' the page can get messed up more easily in some slideshows?
			.delegate('a', 'click keyup keydown keypress', function() {
				if (!settings.useGo) {
					return;
				}
				var key = event.keyCode || event.which;
				if (key && key != 13 && key != 32) {
					// Key pressed, but it wasn't ENTER or SPACE, let them pass through normally.
					return;
				}
				var index = this.id.match(/\d*$/)[0];
				$.deck('go', parseInt(index, 10) );
				return false;
			})
			.appendTo($cont);


		/* Add search-box to document. */
		$cont.appendTo(document.body);
	}


	/* Extend deck.js */
	$[deck]('extend', 'showSearch', showSearch);
	$[deck]('extend', 'removeSearch', removeSearch);
	
	/* Initialize search on deck initialization by default. */
	$d.bind('deck.init', showSearch);
	
})(jQuery, 'deck');
