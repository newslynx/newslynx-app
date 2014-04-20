(function(){

	var router;

	function bindHandlers(){
		// Rail section switching
		$('.rail-section').on('click', function(){
			var data_section = $(this).attr('data-section');
			router.navigate(data_section, {trigger: true});
		});
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
		var formatDate = d3.time.format("%b %Y"),
				legend = {
					facebook: { metric: 'likes', color: "#3B5998" },
					twitter: { metric: 'mentions', color: "#55ACEE" }
				};

		d3.select('#ST-chart')
			.datum(data)
			.call(spottedTail()
				.x(function(d) { return formatDate.parse(d.date); })
				.y(function(d) { return +d.count; })
				.legend(legend))
	}

	function loadTimelineChart(){
			d3.csv('data/dummy-timeline-counts.csv', drawChart)
	}

	loadTimelineChart();
	handleRoute();
	bindHandlers();

}).call(this);
