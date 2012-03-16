# deck.search.js #

Simple extension for [deck.js][] to search content from the slides.

## Requirements ##

* Well, [deck.js][]

## How to install ##

Copy the `search` folder to your deck.js `extensions` folder.

## How to use ##

Insert the following line at the end of your HTML `body`.

	<script src="../extensions/search/deck.search.js"></script>

### Advanced use
You can include additional script to alter default settings. Simple example below:

	<script>
		$.extend(true, $.deck.defaults.search.input, {id : 'search_input'});
	</script>

[deck.js]: https://github.com/imakewebthings/deck.js