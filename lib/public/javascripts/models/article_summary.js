models.article_summary = {
	"Model": models.aa_base_article.Model.extend({
		defaults: {
			active_selected: false,
			selected_for_compare: false,
			selected_for_detail: false
		},
    url: 'api/_VERSION/content'
	})
}