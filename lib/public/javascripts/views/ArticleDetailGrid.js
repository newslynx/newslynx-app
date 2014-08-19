var ArticleDetailGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){
		this.render();
		this.sortAscending = true;
	},

	render: function(){
		var grid_markup = templates.articleGridContainerMarkup;
		this.$el.html(grid_markup);

		return this;
	},

	sortColumn: function(e){
		var $this = $(e.currentTarget);
		// Styling
		$('.header-el').removeClass('active');
		$this.addClass('active');

		// Sorting
		var metric = $this.attr('data-metric');
		this.sortAscending = !this.sortAscending;
		app.instance.$isotopeCntnr.isotope({ sortBy : metric, sortAscending: this.sortAscending })
	}
})

module.exports = ArticleDetailGrid;