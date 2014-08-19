var views = require('./views/index.js');

var helpers = {
	sortNumber: function(a,b) {
		return a - b;
	}
}

console.log(views)

// var load = {
// 	summaries: {
// 		next: function(amount){
// 			amount = amount || 20; // TK default amount to lazy load next article by
// 		},
// 		by: {
// 			tag: function(){
// 				// Calculate the total order amount by agregating
// 				// the prices of only the checked elements
// 				var active_tags = collections.tags.instance.getTrue('active');

// 				// TODO, do filtering articles based on active tags
// 				return active_tags;
// 			},
// 			text: function(){
// 				// TODO
// 			}
// 		}
// 	},
// 	article: function(articleModel){
// 	}
// }

var app = {
	init: {
		articles: function(){
			this.instance = new this.Articles();
		},
		"approval-river": function(){
			this.instance = new this.ApprovalRiver();
		},
		settings: function(){
			this.instance = new this.Settings({model: models.org.instance});
		}
	}
}

var init = {
	go: function(){
		// Call the page specific functions
		var section = $('body').attr('data-section');
		// Their `this` should be the root object so you can still say `this.` even though you're nested in the object
		templates.init[section].call(templates);
		models.init[section].call(models);
		collections.init[section].call(collections);
		app.init[section].call(app);
		routing.init.go.call(routing, section);
	}
}

// init.go();

