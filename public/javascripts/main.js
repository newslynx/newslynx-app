(function(){

	var router;

	function bindHandlers(){
		// Rail section switching
		$('.rail-section').on('click', function(){
			var data_section = $(this).attr('data-section');
			router.navigate(data_section, {trigger: true});
		});

		// Tag event filtering
		$('.tag-filter').on('click', function(){
			$(this).toggleClass('selected');
			checkEventFilters();
		})
	}

	function checkEventFilters(){
		var selected_list = [];
		$('.tag-filter').each(function(index, el){
			var $el = $(el);
			if ($el.hasClass('selected')) selected_list.push($el.attr('data-tag'))
		});

		console.log(selected_list)
		$('.event-item-wrapper').hide();
		for (var i = 0; i < selected_list.length; i++){

			$('.event-item-wrapper[data-tag*="'+selected_list[i]+'"]').show()
		}
	}

	function switchSection(activeSection){
		$('.rail-section-title').removeClass('active');
		$('.content-section').removeClass('shown');
		$('.rail-section[data-section="'+activeSection+'"]').find('.rail-section-title').addClass('active');
		$('.content-section[data-section="'+activeSection+'"]').addClass('shown');
	}

	function handleRoute(){
		var Router = Backbone.Router.extend({
			routes: {
				":section": 'section' // Change the section visibility
			}
		});
		router = new Router;
		router.on('route:section', function(section) {
			switchSection(section);
		});
			
		// For bookmarkable Urls
		Backbone.history.start();
	}

	function drawChart(data){
		var formatDate = d3.time.format("%b %Y");
		var legend =	{
			facebook: {metric: 'likes', color: "#3B5998"},
			twitter: {metric: 'mentions', color: "#55ACEE"}
		}
		var notes = [
			{
				date: 'Sep 2007',
				text: 'A sample note',
				type: ['note']
			},
			{
				date: 'Jul 2005',
				text: 'Major event',
				type: ['major-event']
			},
			{
				date: 'Aug 2006',
				text: 'Citation event',
				type: ['citation']
			}
		]

		d3.select('#ST-chart')
			.datum(data)
			.call(spottedTail()
				.x(function(d) { return formatDate.parse(d.date); })
				.y(function(d) { return +d.count; })
				.margin({right: 20})
				.notes(notes)
				.legend(legend))
	}

	function loadTimelineChart(){
		d3.csv('data/dummy-timeline-counts.csv', drawChart)
	}

	loadTimelineChart();
	handleRoute();
	bindHandlers();

}).call(this);
