/**
 * Search feature for deck.js jQuery-plugin (http://imakewebthings.com/deck.js/).
 * @author markahon@github
 */
(function($, deck) {
	var $d = $(document), $cont;

	var searchSettings = 'search';

	/* Default settings for deck.search.js */
	var defaults = {
		useGo: true,
		container : {
			target: 'body',
			id: 'ds_container',
			styleDefault: {
				position: 'fixed',
				top: '0',
				/* top right corner would be nicer, but it messes up the $.deck display */
				left: '0',
				background: 'none',
				border: 'none',
				padding: '0.4em',
				'font-size': '12pt',
				'z-index': '10'
			},
			styleWithResults : {
				background: '#fff',
				border: '1px solid #aaa',
				'border-left': 'none',
				'border-top': 'none'
			}
		},
		input : {
			id: 'ds_input',
			hint: "Hint: shortcut = ' f '",
			styleInactive: {
				//outline: '1px solid transparent',
				width: '2.1em'
			},
			styleActive: {
				outline: 'none',
				width: 'auto'
			}
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
	// Make deck.search-defaults visible in deck.core-defaults
	$[deck].defaults[searchSettings] = {};
	$.extend(true, $[deck].defaults[searchSettings], defaults);

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

		var settings = $.extend(true, $[deck].defaults[searchSettings], options);
	
		/* Remove any previous instances and re-initialize, if running this function again for some reason. */
		removeSearch();


		/* Init container. */
		$cont = $('<div id="'+settings.container.id+'" />')
			.css(settings.container.styleDefault)
			.bind('focusin', function() {
				$input.css(settings.input.styleActive);
			})
			.bind('focusout', function() {
				$input.removeAttr('placeholder');
					//.attr('placeholder', settings.input.hint)
				if (!$results.html()) {
					$input.css(settings.input.styleInactive);
					$cont.css(settings.container.styleDefault);
				}
			});
		


		/* Init search box. */
		$input = $('<input id="'+settings.input.id+'" type="search" results="5" autocomplete="on" placeholder="'+settings.input.hint+'" />')
			.css(settings.input.styleInactive)
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
						if (hits || i === parseInt(searchString, 10)) {
							var details;

							if (hits) {
								details = ['(', hits.length, ' hit', (hits.length > 1 ? 's' : ''), ')'].join('');
							} else {
								details = '(slide #'+i+')';
							}

							links.push([
								'<a id="result', i , '" href="#', this.id ,'">', '#', this.id , '</a> ',
								'<span style="', settings.results.hitsStyle,'">', details, '</span>',
								'<br>'
								].join('')
							);
						}
					});

					if (!links.length) {
						links.push('(no results)');
					}
				}
				var resultsHTML = links.join('');
				$cont.css(resultsHTML ? settings.container.styleWithResults : settings.container.styleDefault);
				$results.html(resultsHTML);

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
			.appendTo($cont);


		/* Focus search field. (Default = f) */
		$d.bind('keyup.decksearch', function() {
			var key = event.keyCode || event.which;
			if (key === settings.keys.focusSearch) {
				$input.removeAttr('placeholder');
				$input.focus();
			}
		});
		


		/* Init results list. */
		$results = $('<div id="'+settings.results.id+'" />')
			.delegate('a', 'click', function() {
				if (settings.useGo) {
					// Navigate the deck when clicking on result-link using the deck.core 'go'-function.
					// It seems, that without 'go' the page can get messed up more easily in some slideshows?
					var index = this.id.match(/\d*$/)[0];
					$.deck('go', parseInt(index, 10) );
					return false;
				}
			})
			.delegate('a', 'keyup keydown keypress', function() {
				var key = event.keyCode || event.which;			
				if (key && key != 13 && key != 32) {
					// Key pressed, but it wasn't ENTER or SPACE, let them pass through normally.
					return;
				}

				// Stop event propagation from the results not to get mixed with normal deck navigation.... */
				event.stopPropagation();

				// ... but do something only on keyup events.
				if (event.type !== 'keyup') {
					return;
				}

				// Handle keyup as click. Note, that this simple approach doesn't work if not using 'go'.
				// That's because space/enter on links won't be handled as they normally would in browsers (deck.core probably stops them).
				// We would have to simulate "real" mouse click, see e.g. http://stackoverflow.com/questions/1421584/how-can-i-simulate-a-click-to-an-anchor-tag.
				$(this).click();
				return false;
			})
			/* Hide results if ESC is pressed when focused on results. */
			.bind('keyup', function() {
				var key = event.keyCode || event.which;	
				if (key === settings.keys.blurSearch) {
					$input.val('').trigger('click');
					$cont.trigger('focusout');
				}
			})
			.appendTo($cont);


		/* Add search-box to document. */
		$cont.appendTo(settings.container.target);
	}


	/* Extend deck.js */
	$[deck]('extend', 'showSearch', showSearch);
	$[deck]('extend', 'removeSearch', removeSearch);

	/* Initialize search on deck initialization by default. */
	$d.bind('deck.init', showSearch);

	$(function() {
		// Pick same font-family as used in slide titles.
		$.extend(true, $.deck.defaults.search.container.styleDefault, {'font-family' : $('.slide:first').css('font-family')});
	});
	
})(jQuery, 'deck');