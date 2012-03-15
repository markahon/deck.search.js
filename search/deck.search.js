/**
 * Search feature for jQuery.deck (http://imakewebthings.com/deck.js/).
 * @author markahon@github
 */
(function($, deck) {
	var $d = $(document), $cont;


	/* Default settings. */
	var defaults = {
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
			id: 'ds_results'
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
				var links = "";
				if (searchString.length) {	
					var regex = new RegExp(searchString, 'im');
					$('section.slide').each(function(i,n) {
						if ($(this).text().search(regex) > -1) {
							links += ['<div id="result',i,'">','<a href="#', this.id ,'">', 'Jump to #'+this.id ,'</a>', '</div>'].join('');
						}
					});
				}
				$results.html(links);

				/* ENTER -> Move to first search result. */
				var key = event.keyCode || event.which;
				if (key === 13) {
				  $results.find('a:first').click();
				}
				
				/* ESC -> Blur the search field to allow normal keyboard navigation. */
				else if (key === 27) {
				  $(this).blur();
				}
			})
			.bind('click', function() {
				if (!$(this).val().length) {
					/* Empty results, when the "empty this input" -icon in search field is clicked. */
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


		/* F-key -> Focus search field. */
		$d.bind('keyup.decksearch', function() {
			var key = event.keyCode || event.which;
			if (key === 70) {
				$input.focus();
			}
		});
		


		/* Init results list. */
		$results = $('<div id="'+settings.results.id+'" />')
			/*
			// Navigate the deck when clicking on result-link.
			// This was initially a fallback to use deck-goto-extension. Works if slides are numbered, but not needed if deck.js core 'hashchange' event handling works.
			.delegate('a', 'click keyup keydown keypress', function() {
				var key = event.keyCode || event.which;
				if (key && key != 13 && key != 32) {
					// Key pressed, but it wasn't ENTER or SPACE, let them pass through normally.
					return;
				}
				var index = $(this).text().match(/\d*$/)[0];
				$.deck('go', parseInt(index, 10) );
				return false;
			})
			*/
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

//$.deck('showSearch');