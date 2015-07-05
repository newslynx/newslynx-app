models.article_summary = {
	"Model": models.aa_base_article.Model.extend({
		defaults: {
			active_selected: false,
			selected_for_compare: false,
			selected_for_detail: false
			// in_drawer: true,
			// destroy: false
		}
	})
}