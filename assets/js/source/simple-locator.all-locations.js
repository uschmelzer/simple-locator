/**
* Display a single location map
*/
var SimpleLocator = SimpleLocator || {};
SimpleLocator.AllLocations = function()
{
	var self = this;
	var $ = jQuery;

	self.locations = [];
	self.mapIndex;
	self.activeMap;
	self.formData = {}; // Data to send in request

	self.selectors = {
		map : 'data-simple-locator-all-locations-map'
	}

	self.bindEvents = function()
	{
		if ( $('[' + self.selectors.map + ']').length < 1 ) return;
		$(document).ready(function(){
			self.getData();
		});
	}

	self.setMapIndex = function()
	{
		var maps = $('[' + SimpleLocator.selectors.map + ']');
		self.mapIndex = $(self.activeMap).index(maps);
	}

	/**
	* Set the taxonomy arguments, provided through data-taxfilter- attributes
	*/
	self.setTaxonomyArgs = function()
	{
		var data = $(self.activeMap).data();
		var taxonomies = {};
		$.each(data, function(i, v){
			if ( i.indexOf('taxfilter') === 0 ){
				var taxonomy = i.substring(9).toLowerCase();
				var terms = ( typeof v !== 'number' ) ? v.split(',') : [v];
				taxonomies[taxonomy] = terms;
			}
		});
		self.formData.taxfilter = taxonomies;
	}

	/**
	* Set the limit arg, provided through data-limit attribute
	*/
	self.setLimitArgs = function()
	{
		self.formData.limit = $(self.activeMap).attr('data-limit');
		if ( typeof self.formData.limit === 'undefined' || self.formData.limit === '' ) self.formData.limit = '-1';
	}

	self.getData = function()
	{
		var maps = $('[' + self.selectors.map + ']');
		$.each(maps, function(){
			self.activeMap = $(this);
			self.setMapIndex();
			self.setTaxonomyArgs();
			self.setLimitArgs();
			$.ajax({
				url : SimpleLocator.endpoints.locations,
				type: 'GET',
				datatype: 'json',
				data : self.formData,
				beforeSend : function(i, v){
					console.log(self.formData);
					console.log(v.url);
				},
				success: function(data){
					self.locations = data;
					self.loadMap();
				},
				error: function(data){
					if ( wpsl_locator.jsdebug === '1' ){
						console.log('All Locations Error');
					}
				}
			});
		});
	}

	self.loadMap = function()
	{	
		SimpleLocator.markers[self.mapIndex] = [];
		var locations = self.locations;
		var mapstyles = wpsl_locator.mapstyles;
		var bounds = new google.maps.LatLngBounds();
		var mapOptions = {
			mapTypeId: 'roadmap',
			mapTypeControl: false,
			zoom: 8,
			styles: mapstyles,
			panControl : false
		}
		if ( wpsl_locator.custom_map_options === '1' )	mapOptions = wpsl_locator.map_options;
			
		var infoWindow = new google.maps.InfoWindow(), marker, i;
		var map = new google.maps.Map( $(self.activeMap)[0], mapOptions );
		
		// Loop through array of markers & place each one on the map  
		for( i = 0; i < locations.length; i++ ) {
			var position = new google.maps.LatLng(locations[i].latitude, locations[i].longitude);
			bounds.extend(position);
			
			var marker = new google.maps.Marker({
				position: position,
				map: map,
				title: locations[i].title,
				icon: locations[i].mappin
			});	

			// Info window for each marker 
			google.maps.event.addListener(marker, 'click', (function(marker, i){
				return function() {
					infoWindow.setContent(locations[i].infowindow);
					infoWindow.open(map, marker);
					$(document).trigger('simple-locator-all-locations-marker-clicked', [marker, infoWindow]);
					wpsl_all_locations_marker_clicked(marker, infoWindow); // Deprecated
				}
			})(marker, i));

			 // Push the marker to the global 'markers' array
        	SimpleLocator.markers[self.mapIndex].push(marker);
			
			// Center the Map
			map.fitBounds(bounds);
			var listener = google.maps.event.addListener(map, "idle", function() { 
					if ( locations.length < 2 ) {
					map.setZoom(13);
				}
				google.maps.event.removeListener(listener); 
			});
		}

		SimpleLocator.maps[self.mapIndex] = map;
		self.loadList();

		$(document).trigger('simple-locator-all-locations-rendered', [map]);
		wpsl_all_locations_rendered(map); // Deprecated
	}

	self.loadList = function()
	{
		var formContainer = $(self.map).parents('[' + SimpleLocator.selectors.formContainer + ']');
		if ( formContainer.length < 1 ) return;

		var container = $(self.activeForm).attr('data-simple-locator-results-container');
		if ( typeof container === 'undefined' || container === ''){
			container = $(formContainer).find('[' + SimpleLocator.selectors.results + ']');
		}

		var output = '<h3 class="wpsl-results-header">' + wpsl_locator.alllocations + '</h3>';
		if ( wpsl_locator_options.resultswrapper !== "" ) output += '<' + wpsl_locator_options.resultswrapper + '>';
		for( i = 0; i < self.locations.length; i++ ) {
			output = output + self.locations[i].output;
		}
		if ( wpsl_locator_options.resultswrapper !== "" ) output += '</' + wpsl_locator_options.resultswrapper + '>';
		$(container).html(output);
	}

	return self.bindEvents();
}