"use strict";

var helpers = helpers || {};

var templates = templates || {};

var models = models || {};

var collections = collections || {};

var app = app || {};

var views = views || {};

var routing = routing || {};

helpers.common = {
    sortNumber: function(a, b) {
        return a - b;
    }
};

helpers.modelsAndCollections = {
    toggle: function(key) {
        this.set(key, !this.get(key));
    },
    setBoolByIds: function(trueKey, idKey, ids, bool) {
        ids = ids.split("+").map(function(id) {
            return +id;
        });
        ids.forEach(function(id) {
            var where_obj = {};
            where_obj[idKey] = id;
            if (this.where(where_obj).length) this.where(where_obj)[0].set(trueKey, bool);
        }, this);
    },
    addTagsFromId: function(objectList) {
        objectList.forEach(function(item) {
            item.subject_tags = $.extend(true, [], item.subject_tags.map(function(d) {
                return pageData.org["subject_tags"].filter(function(f) {
                    return f.id == d;
                })[0];
            }));
            item.events.forEach(function(ev) {
                ev.impact_tags = $.extend(true, [], ev.impact_tags.map(function(d) {
                    return pageData.org["impact_tags"].filter(function(f) {
                        return f.id == d;
                    })[0];
                }));
            });
        });
        return objectList;
    },
    metadata: function(prop, value) {
        if (value === undefined) {
            return this[prop];
        } else {
            this[prop] = value;
        }
    }
};

helpers.templates = {
    addCommas: function(x) {
        x = x.toString();
        if (x) {
            return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            console.log("Warning: Expected string, found", x);
            return "0";
        }
    },
    autolink: function(text) {
        return Autolinker.link(text);
    },
    toLowerCase: function(str) {
        return str.toLowerCase();
    },
    toTitleCase: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1, str.length);
    },
    serviceFromSource: function(src) {
        return src.split("-")[0];
    },
    serviceFromAlertId: function(id) {
        var underscore_arr = id.split("-")[0].split("_"), service = underscore_arr.pop();
        return service;
    },
    methodFromSource: function(src) {
        return this.prettyName(src.split("-")[1]);
    },
    prettyPrintSource: function(src) {
        src = src.replace(/-/g, " ").replace(/_/g, " ");
        return helpers.templates.toTitleCase(src);
    },
    toUserTimezone: function(utcTimestamp) {
        utcTimestamp = utcTimestamp * 1e3;
        var utc_moment = moment(utcTimestamp), user_timezone_moment = utc_moment.tz(pageData.timezone);
        return user_timezone_moment;
    },
    prettyDate: function(utcTimestamp) {
        var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp), user_timezone_string = user_timezone_moment.format("MMM D, YYYY");
        return user_timezone_string;
    },
    prettyTimestamp: function(utcTimestamp) {
        var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp), user_timezone_string = user_timezone_moment.format("M/D/YYYY, h:m a");
        return user_timezone_string;
    },
    conciseDate: function(utcTimestamp) {
        var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp), user_timezone_string = user_timezone_moment.format("MM-DD-YY");
        return user_timezone_string;
    },
    formatEnabled: function(bool) {
        if (bool) return "Recipe is active";
        return "Recipe not active";
    },
    formatDefaultEventEnabled: function(bool) {
        if (bool) return "Enabled";
        return "Disabled";
    },
    getAssociatedItems: function(id, itemKey, itemsObj) {
        itemsObj = pageData[itemsObj];
        return _.filter(itemsObj, function(obj) {
            return obj[itemKey] == id;
        });
    },
    combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName) {
        if (schema_obj.name) schema_obj.name.selected = recipeName;
        _.each(settings_obj, function(setting, fieldName) {
            if (!schema_obj[fieldName]) console.log(schema_obj, fieldName);
            var selected_array = schema_obj[fieldName].selected || [];
            if (fieldName != "impact_tags" && fieldName != "assignees") {
                schema_obj[fieldName].selected = setting;
            } else {
                schema_obj[fieldName].selected = selected_array.concat(setting);
            }
        });
        return schema_obj;
    },
    prettyName: function(name) {
        name = name.replace(/_/g, " ");
        return name.charAt(0).toUpperCase() + name.slice(1);
    },
    escapeQuotes: function(term) {
        if (!term) {
            return false;
        }
        if (typeof term !== "string") {
            return term;
        }
        return term.replace(/"/g, "&quot;");
    },
    displaySearchParams: function(source, settings) {
        if (source == "google-alert") return settings.search_query; else if (source == "twitter-search") return settings.q; else if (source == "twitter-list") return settings.slug + "," + settings.filter; else if (source == "twitter-user") return settings.screen_name + "," + settings.filter; else if (source == "reddit-search") return settings.search_query; else if (source == "facebook-page") return settings.page_id + "," + settings.filter; else console.log("You need to add a search_query key `templates.js` to display this type of recipe.");
    },
    getRecipeFromId: function(id) {
        return _.findWhere(pageData.accountRecipes, {
            id: id
        });
    },
    htmlDecode: function(input) {
        var e = document.createElement("div");
        e.innerHTML = input;
        return e.childNodes[0].nodeValue;
    },
    boolToStr: function(bool, str) {
        var response;
        if (bool) {
            response = str;
        } else {
            response = "";
        }
        return response;
    },
    getHeadlineFromArticleId: function(Id) {
        return _.findWhere(pageData.articleSkeletons, {
            id: Id
        }).title;
    }
};

models.alert = {
    Model: Backbone.Model.extend({})
};

models.app = {
    Model: Backbone.Model.extend({})
};

models.article_detailed = {
    Model: Backbone.Model.extend({
        url: function() {
            return "/api/articles/" + this.get("id") + "/details";
        },
        getTimeSeriesStats: function() {
            var timeseries_stats = this.get("timeseries_stats"), timeseries_metrics = [ "pageviews", "twitter_count", "facebook_share_count" ], timeseries_filtered;
            timeseries_filtered = timeseries_stats.map(function(timeseries_stat) {
                var keys = _.keys(timeseries_stat), filtered_obj = {};
                timeseries_metrics.forEach(function(timeseries_metric) {
                    var stat_has_metric = _.contains(keys, timeseries_metric);
                    if (stat_has_metric) {
                        filtered_obj["timestamp"] = timeseries_stat.timestamp;
                        filtered_obj[timeseries_metric] = timeseries_stat[timeseries_metric];
                    }
                });
                return filtered_obj;
            });
            return timeseries_filtered;
        }
    })
};

models.article_summary = {
    Model: Backbone.Model.extend({
        defaults: {
            selected_for_compare: true,
            in_drawer: true,
            destroy: false
        }
    })
};

models.event = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/events"
    })
};

models.impact_tag = {
    Model: Backbone.Model.extend({
        defaults: {
            active: false,
            category: null,
            level: null
        },
        toggle: helpers.modelsAndCollections.toggle
    })
};

models.org = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/organization/settings",
        idAttribute: "uqbar"
    })
};

models.recipe = {
    Model: Backbone.Model.extend({
        defaults: {
            viewing: false,
            enabled: true
        },
        toggle: helpers.modelsAndCollections.toggle
    })
};

models.recipe_creator = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/recipes"
    })
};

models.section_mode = {
    Model: Backbone.Model.extend({})
};

models.subject_tag = {
    Model: Backbone.Model.extend({
        defaults: {
            active: false
        },
        toggle: helpers.modelsAndCollections.toggle
    })
};

collections.active_alerts = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.alert.Model,
        metadata: helpers.modelsAndCollections.metadata,
        url: "api/alerts"
    })
};

collections.all_alerts = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.alert.Model,
        metadata: helpers.modelsAndCollections.metadata
    })
};

collections.article_comparisons = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_summary.Model,
        metadata: helpers.modelsAndCollections.metadata,
        set: function() {
            Backbone.Collection.prototype.set.apply(this, arguments);
            this.updateHash();
        },
        remove: function() {
            Backbone.Collection.prototype.remove.apply(this, arguments);
            this.updateHash();
        },
        sort: function(options) {
            if (!this.comparator) throw new Error("Cannot sort a set without a comparator");
            options || (options = {});
            if (_.isString(this.comparator) || this.comparator.length === 1) {
                this.models = this.sortBy(this.comparator, this);
            } else {
                this.models.sort(_.bind(this.comparator, this));
            }
            if (!options.silent) this.trigger("sort", this, options);
            this.updateHash();
            return this;
        },
        updateHash: function() {
            this.hash = this.pluck("id").join("+");
        },
        getHash: function() {
            return this.hash;
        },
        redrawMarkers: function() {
            this.trigger("resetMetricHeaders");
            this.models.forEach(function(model) {
                model.trigger("redrawMarker");
            });
        }
    })
};

collections.article_detailed = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_detailed.Model,
        metadata: helpers.modelsAndCollections.metadata,
        set: function() {
            var incoming_model = arguments[0][0];
            if (!(incoming_model instanceof Backbone.Model)) {
                arguments[0][0] = this.addTagInformation(incoming_model);
            }
            Backbone.Collection.prototype.remove.call(this, this.models);
            Backbone.Collection.prototype.set.apply(this, arguments);
            this.updateHash();
            Backbone.Collection.prototype.add.apply(collections.articles_detailed.instance, arguments);
        },
        updateHash: function() {
            this.hash = this.pluck("id")[0];
        },
        getHash: function() {
            return this.hash;
        },
        hydrateTagsInfo: function(dehydratedObjectList, info, tagKeys) {
            dehydratedObjectList.forEach(function(dehydratedObject) {
                tagKeys.forEach(function(key) {
                    if (dehydratedObject[key]) {
                        dehydratedObject[key + "_full"] = dehydratedObject[key].map(function(id) {
                            return _.chain(info[key]).findWhere({
                                id: id
                            }).clone().value();
                        }).sort(function(a, b) {
                            return a.name.localeCompare(b.name);
                        });
                    }
                });
                if (dehydratedObject.impact_tags_full) {
                    var impact_tag_categories = _.chain(dehydratedObject.impact_tags_full).pluck("category").uniq().value();
                    var impact_tag_levels = _.chain(dehydratedObject.impact_tags_full).pluck("level").uniq().value();
                    dehydratedObject["impact_tag_categories"] = impact_tag_categories.sort();
                    dehydratedObject["impact_tag_levels"] = impact_tag_levels.sort();
                }
            });
            return dehydratedObjectList;
        },
        addLevelColors: function(promotions) {
            return promotions.map(function(promotion) {
                var color = pageData.attributeColorLookup[promotion.level];
                promotion.color = color;
                return promotion;
            });
        },
        addTagInformation: function(articleDetail) {
            var info = _.clone(pageData);
            articleDetail = this.hydrateTagsInfo([ articleDetail ], info, [ "subject_tags" ])[0];
            articleDetail.events = this.hydrateTagsInfo(articleDetail.events, info, [ "impact_tags" ]);
            articleDetail.promotions = this.addLevelColors(articleDetail.promotions);
            var impact_tags_full_with_dupes = _.chain(articleDetail.events).pluck("impact_tags_full").flatten().value();
            var impact_tags_full = _.chain(impact_tags_full_with_dupes).uniq(function(d) {
                return d.id;
            }).map(function(tag) {
                tag.count = _.where(impact_tags_full_with_dupes, {
                    id: tag.id
                }).length;
                return tag;
            }).value();
            var impact_tag_categories_with_dupes = _.chain(articleDetail.events).pluck("impact_tag_categories").flatten().value();
            var impact_tag_categories = _.chain(impact_tag_categories_with_dupes).uniq().map(function(category) {
                var attr_obj = _.findWhere(info.impact_tag_categories, {
                    name: category
                });
                attr_obj.count = _.filter(impact_tag_categories_with_dupes, function(d) {
                    return d == category;
                }).length;
                return attr_obj;
            }).value();
            var impact_tag_levels_with_dupes = _.chain(articleDetail.events).pluck("impact_tag_levels").flatten().value();
            var impact_tag_levels = _.chain(impact_tag_levels_with_dupes).uniq().map(function(level) {
                var attr_obj = _.findWhere(info.impact_tag_levels, {
                    name: level
                });
                attr_obj.count = _.filter(impact_tag_levels_with_dupes, function(d) {
                    return d == level;
                }).length;
                return attr_obj;
            }).value();
            articleDetail["impact_tags_full"] = impact_tags_full.sort();
            articleDetail["impact_tag_categories"] = impact_tag_categories.sort();
            articleDetail["impact_tag_levels"] = impact_tag_levels.sort();
            return articleDetail;
        }
    })
};

collections.article_detailed_events = {
    categories_instance: null,
    levels_instance: null,
    Collection: Backbone.Collection.extend({
        model: models.event.Model,
        metadata: helpers.modelsAndCollections.metadata
    })
};

collections.article_detailed_impact_tag_attributes = {
    categories_instance: null,
    levels_instance: null,
    Collection: Backbone.Collection.extend({
        model: models.impact_tag.Model,
        metadata: helpers.modelsAndCollections.metadata
    })
};

collections.article_detailed_impact_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.impact_tag.Model,
        set: function() {
            Backbone.Collection.prototype.remove.call(this, this.models);
            Backbone.Collection.prototype.set.apply(this, arguments);
        }
    })
};

collections.article_detailed_subject_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.subject_tag.Model,
        url: function() {
            var article_id = collections.article_detailed.instance.pluck("id")[0];
            return "/api/articles/" + article_id + "/subjects";
        },
        set: function() {
            Backbone.Collection.prototype.remove.call(this, this.models);
            Backbone.Collection.prototype.set.apply(this, arguments);
        }
    })
};

collections.article_summaries = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_summary.Model,
        url: "api/articles/summary"
    })
};

collections.articles_detailed = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_detailed.Model
    })
};

collections.impact_tag_attributes = {
    categories_instance: null,
    levels_instance: null,
    Collection: Backbone.Collection.extend({
        model: models.impact_tag.Model,
        metadata: helpers.modelsAndCollections.metadata
    })
};

collections.impact_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.impact_tag.Model,
        url: "/api/tags/impact",
        metadata: helpers.modelsAndCollections.metadata,
        initialize: function() {
            this.metadata("filter", "impact_tags");
            return this;
        }
    })
};

collections.po = {
    sorts: {}
};

collections.recipes = {
    instance: null,
    schemas_instance: null,
    Collection: Backbone.Collection.extend({
        url: "/api/recipes",
        model: models.recipe.Model,
        setBoolByIds: helpers.modelsAndCollections.setBoolByIds,
        comparator: function(recipe) {
            return -recipe.id;
        }
    })
};

collections.subject_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.subject_tag.Model,
        metadata: helpers.modelsAndCollections.metadata,
        initialize: function() {
            this.metadata("filter", "subject_tags");
            return this;
        }
    })
};

app.ApprovalRiver = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click .scroll-to": "scrollTo",
        "click .load-more": "moreAlerts"
    },
    initialize: function() {
        this._subviews = [];
        this.$drawer = $("#drawer");
        this.$content = $("#content");
        this.$divisionSwitcher = $(".division-switcher");
        this.listenTo(models.section_mode, "change:mode", this.sectionMode.update);
        views.po.alerts.on("update", this.content.setActiveAlerts);
        views.po.alerts.on("addMoreAlerts", this.content.addActiveAlerts);
        this.listenTo(collections.active_alerts.instance, "add", this.alerts.add);
        this.listenTo(collections.active_alerts.instance, "remove", this.alerts.remove);
        this.render();
    },
    saveHash: function(mode) {
        routing.router.navigate(mode);
    },
    sectionMode: {
        update: function(model, mode) {
            mode = mode || model.get("mode");
            this.killAllSubviews();
            this.sectionMode[mode].call(this);
            this.saveHash(mode);
            return this;
        },
        "my-recipes": function() {
            var $drawer = this.$drawer, $drawerPointers = $drawer.find("#drawer-pointers-container"), $content = this.$content, $recipes = $("#recipes");
            $drawer.attr("data-mode", "my-recipes");
            var has_recipes = collections.recipes.account_instance.length;
            var show_all_view = new views.ShowAllRecipes({}), show_all_markup = show_all_view.render(has_recipes).el;
            this._subviews.push(show_all_view);
            this.show_all_view = show_all_view;
            $drawerPointers.html(show_all_markup);
            if (has_recipes) {
                collections.recipes.account_instance.each(function(accountRecipeModel) {
                    var item_view = new views.RecipeDrawer({
                        model: accountRecipeModel
                    }), item_markup = item_view.render().el;
                    this._subviews.push(item_view);
                    $recipes.append(item_markup);
                }, this);
            } else {
                $content.html('<div class="placeholder">You don\'t have any pending alerts. Click <a href="/approval-river#create">create</a> to make some. &mdash; <em>Merlynne</em></div>');
            }
            app.instance.setLoadMoreButton.call(app.instance);
            return this;
        },
        create: function() {
            var $drawer = this.$drawer, $drawerPointers = $drawer.find("#drawer-pointers-container"), $content = this.$content, $recipes = $("#recipes");
            var recipe_creator_prep_markup = templates.drawerCreatePrep;
            $drawerPointers.html(recipe_creator_prep_markup);
            collections.recipes.schemas_instance.each(function(recipeSchema) {
                var item_view = new views.RecipeSchemaListItem({
                    model: recipeSchema
                }), item_el = item_view.render().el;
                this._subviews.push(item_view);
                $recipes.append(item_el);
            }, this);
            collections.recipes.schemas_instance.each(function(recipeSchema) {
                var item_view = new views.RecipeSchemaForm({
                    model: recipeSchema
                }), item_el = item_view.render().el;
                this._subviews.push(item_view);
                $content.append(item_el);
            }, this);
            return this;
        }
    },
    alerts: {
        add: function(alertModel) {
            var item_view, item_el;
            item_view = new views.Alert({
                model: alertModel
            });
            item_el = item_view.render().el;
            this._subviews.push(item_view);
            this.$content.append(item_el);
            return this;
        },
        remove: function(alertModel) {
            alertModel.set("destroy", "remove");
            return this;
        }
    },
    render: function() {
        new views.DivisionSwitcher({
            model: models.section_mode,
            el: this.$divisionSwitcher
        });
        return this;
    },
    content: {
        setActiveAlerts: function() {
            var current_filtered_set = views.po.alerts.getCurrentItems();
            app.instance.setLoadMoreButton.call(app.instance);
            collections.active_alerts.instance.set([]);
            if (current_filtered_set.length === 0) {
                app.instance.$content.html("<div class=\"placeholder\">This recipe doesn't have any pending alerts. It'll keep searching! &mdash; <em>Merlynne</em></div>");
            } else {
                app.instance.$content.html("");
            }
            collections.active_alerts.instance.set(current_filtered_set);
            return this;
        },
        addActiveAlerts: function() {
            var current_filtered_set = views.po.alerts.getCurrentItems();
            app.instance.setLoadMoreButton.call(app.instance);
            collections.active_alerts.instance.add(current_filtered_set);
            return this;
        }
    },
    setLoadMoreButton: function() {
        var po = views.po.alerts, total_length = collections.po.alerts.items.length, match_set_length = po.match_set.cids.length, page_size = po.page_size, $loadMore = this.$drawer.find(".load-more");
        var diff = match_set_length - page_size;
        if (diff > 0) {
            $loadMore.html("Showing " + page_size + " of " + match_set_length + " alerts. Load more...").parent().removeClass("disabled").prop("disabled", false);
        } else if (page_size >= total_length) {
            $loadMore.html("Loaded all " + total_length + " alerts.").parent().addClass("disabled").prop("disabled", true);
        } else {
            $loadMore.html("Showing " + match_set_length + " matching alerts.").parent().addClass("disabled").prop("disabled", true);
        }
        return this;
    },
    moreAlerts: function() {
        var current_page_size = views.po.alerts.page_size;
        views.po.alerts.page_size = current_page_size + 25;
        views.po.alerts.trigger("addMoreAlerts");
        return this;
    },
    scrollTo: function(e) {
        var dest = $(e.currentTarget).attr("data-destination");
        this.$content.animate({
            scrollTop: this.$content.scrollTop() + $("#" + dest + "-recipe").position().top - parseFloat(this.$content.css("padding-top"))
        }, 200);
    }
});

app.Articles = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click .add-to-comparison": "addToComparison",
        "click .option-title .show-hide": "showHideList",
        "change .toggle-all": "toggleAllDrawer",
        "click #alter-comparison-marker": "updateComparisonMarker",
        "click .load-more": "moreSummaryArticles",
        "click .go-to-detail": "goToDetail"
    },
    initialize: function() {
        this._subviews = [];
        this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
        this.$impactTagCategoriesList = $('.option-container[data-type="impact-tag-categories"] .tag-list');
        this.$impactTagLevelsList = $('.option-container[data-type="impact-tag-levels"] .tag-list');
        this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
        this.$articleList = $("#article-list");
        this.$drawer = $("#drawer");
        this.$content = $("#content");
        this.$divisionSwitcher = $(".division-switcher");
        this.$drawerPointersCntnr = $("#drawer-pointers-container");
        this.$articleTitleSearcher = $("#article-title-searcher");
        this.$dateRangeSearcher = $("#date-range-searcher");
        this.$articleDrawerSorter = $("#article-drawer-sorter");
        this.isotopeCntnr = ".rows";
        this.isotopeChild = ".article-detail-row-wrapper";
        this.listenTo(models.section_mode, "change:mode", this.sectionMode.update);
        views.po.article_summaries.on("update", this.drawer.setActiveArticleSummaries);
        views.po.article_summaries.on("addToDrawer", this.drawer.addActiveArticleSummaries);
        this.listenTo(collections.article_summaries.instance, "add", this.drawer.add);
        this.listenTo(collections.article_summaries.instance, "remove", this.drawer.remove);
        this.listenTo(collections.article_comparisons.instance, "add", this.comparison.add);
        this.listenTo(collections.article_comparisons.instance, "remove", this.comparison.remove);
        this.listenTo(collections.article_detailed.instance, "add", this.detail.add);
        this.listenTo(collections.article_detailed.instance, "remove", this.detail.remove);
        this.render();
        var that = this;
        this.$content.on("scroll", function() {
            var $content = $(this);
            that.onScrollTick.call(that, $content);
        });
    },
    render: function() {
        this.$drawerPointersCntnr.append(templates.drawerPointers);
        if (collections.subject_tags.instance.length) {
            this.$subjectTagList.html("");
            collections.subject_tags.instance.each(function(tag) {
                var tag_view = new views.Tag({
                    model: tag
                });
                this.$subjectTagList.append(tag_view.render().el);
            }, this);
        }
        if (collections.impact_tag_attributes.categories_instance.length) {
            this.$impactTagCategoriesList.html("");
            collections.impact_tag_attributes.categories_instance.each(function(tag) {
                var tag_view = new views.Tag({
                    model: tag
                });
                this.$impactTagCategoriesList.append(tag_view.render().el);
            }, this);
        }
        if (collections.impact_tag_attributes.levels_instance.length) {
            this.$impactTagLevelsList.html("");
            collections.impact_tag_attributes.levels_instance.each(function(tag) {
                var tag_view = new views.Tag({
                    model: tag
                });
                this.$impactTagLevelsList.append(tag_view.render().el);
            }, this);
        }
        if (collections.impact_tags.instance.length) {
            this.$impactTagList.html("");
            collections.impact_tags.instance.each(function(tag) {
                var tag_view = new views.Tag({
                    model: tag
                });
                this.$impactTagList.append(tag_view.render().el);
            }, this);
        }
        collections.article_summaries.instance.each(function(article) {
            var article_view = new views.ArticleSummaryDrawer({
                model: article
            });
            this.$articleList.append(article_view.render().el);
        }, this);
        new views.DivisionSwitcher({
            model: models.section_mode,
            el: this.$divisionSwitcher
        });
        new views.ArticleTitleSearcher({
            el: this.$articleTitleSearcher
        });
        new views.DateRangeSearcher({
            el: this.$dateRangeSearcher
        });
        new views.ArticleDrawerSorter({
            el: this.$articleDrawerSorter
        });
        return this;
    },
    sectionMode: {
        update: function(model, mode) {
            mode = mode || model.get("mode");
            this.killAllSubviews();
            this.sectionMode[mode].call(this);
            collections.article_summaries.instance.each(function(articleSummary) {
                var section_selection_key = "selected_for_" + mode, selected_for_section = articleSummary.get(section_selection_key) || false;
                var id = articleSummary.id, po_model = _.findWhere(collections.po.article_summaries.items, {
                    id: id
                });
                po_model[section_selection_key] = selected_for_section;
                articleSummary.set("active_selected", selected_for_section);
            });
            return this;
        },
        compare: function() {
            var article_grid = new views.ArticleComparisonGrid();
            this._subviews.push(article_grid);
            this.$content.html(article_grid.render().el);
            this.$listContainer = $("#compare-grid .rows");
            app.helpers.isotope.initCntnr.call(this);
            this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button').prop("disabled", false).parent().removeClass("disabled");
            var sort_by = collections.article_comparisons.instance.metadata("sort_by"), sort_ascending = collections.article_comparisons.instance.metadata("sort_ascending");
            $(".header-el").attr("data-sort-ascending", sort_ascending);
            var compare_models = collections.article_comparisons.instance.models;
            if (!compare_models.length) {
                compare_models = collections.article_summaries.instance.where({
                    selected_for_compare: true,
                    in_drawer: true
                });
                if (sort_by) {
                    compare_models = _.sortBy(compare_models, function(compare_model) {
                        return compare_model.get(sort_by);
                    });
                    if (sort_ascending === false) {
                        compare_models.reverse();
                    }
                }
            }
            collections.article_comparisons.instance.reset();
            collections.article_comparisons.instance.set(compare_models);
            this.saveHash();
            return this;
        },
        detail: function() {
            this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button').prop("disabled", true).parent().addClass("disabled");
            this.detail.loadModel.call(this, this.staged_article_detail, this.detail.loadPage);
            return this;
        }
    },
    toggleAllDrawer: function(e) {
        var checked = $(e.currentTarget).find("input").prop("checked"), mode = models.section_mode.get("mode"), selected_for = "selected_for_" + mode;
        collections.article_summaries.instance.each(function(summaryModel) {
            if (mode == "compare") {
                summaryModel.set(selected_for, checked);
            }
            summaryModel.set("active_selected", checked);
        });
        return this;
    },
    drawer: {
        setActiveArticleSummaries: function() {
            var current_filtered_set = views.po.article_summaries.getCurrentItems();
            app.instance.setLoadMoreButton.call(app.instance);
            collections.article_summaries.instance.set([]);
            collections.article_summaries.instance.set(current_filtered_set);
            app.instance.$drawer.find(".drawer-list-outer").shiftSelectable();
            return this;
        },
        addActiveArticleSummaries: function() {
            var current_filtered_set = views.po.article_summaries.getCurrentItems();
            app.instance.setLoadMoreButton.call(app.instance);
            collections.article_summaries.instance.add(current_filtered_set);
            return this;
        },
        add: function(summaryModel) {
            var item_view, item_el;
            item_view = new views.ArticleSummaryDrawer({
                model: summaryModel
            });
            item_el = item_view.render().el;
            this.$articleList.append(item_el);
            return this;
        },
        remove: function(summaryModel) {
            summaryModel.set("in_drawer", false);
            return this;
        }
    },
    addToComparison: function(e) {
        var $btn = $(e.currentTarget), action = $btn.attr("data-action"), sort_by, sort_ascending;
        var selected_models = collections.article_summaries.instance.where({
            selected_for_compare: true,
            in_drawer: true
        }), action;
        if (action == "replace") {
            action = "set";
        } else if (action == "add") {
            action = "add";
        }
        collections.article_comparisons.instance[action](selected_models);
        sort_by = collections.article_comparisons.instance.metadata("sort_by");
        sort_ascending = collections.article_comparisons.instance.metadata("sort_ascending");
        app.helpers.isotope.relayout(sort_by, sort_ascending);
        this.saveHash();
        return this;
    },
    comparison: {
        add: function(summaryModel) {
            var item_view, item_el;
            item_view = new views.ArticleSummaryRow({
                model: summaryModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            this.$listContainer.append(item_el);
            app.helpers.isotope.addItem.call(app.instance, item_el);
            return this;
        },
        remove: function(comparisonModel) {
            comparisonModel.set("destroy", "delete");
            return this;
        }
    },
    detail: {
        add: function(detailModel) {
            var item_view, item_el;
            item_view = new views.ArticleDetail({
                model: detailModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            this.$content.html(item_el);
            item_view.bakeInteractiveBits();
            return this;
        },
        remove: function(detailModel) {
            detailModel.set("destroy", true);
            return this;
        },
        loadPage: function(model) {
            collections.article_detailed.instance.set([ model ]);
            this.saveHash();
        },
        getDetailModelFromId: function(detail_model_id, cb) {
            var that = this, fetch_options = {
                data: {
                    sparse: true
                },
                processData: true,
                success: function(collection, response, options) {
                    cb.call(that, response);
                },
                error: function(model, err) {
                    console.log("Error fetching article detail" + detail_model_id, err);
                }
            }, detail_model;
            detail_model = collections.articles_detailed.instance.findWhere({
                id: detail_model_id
            });
            if (!detail_model) {
                detail_model = new models.article_detailed.Model({
                    id: detail_model_id
                });
                detail_model.fetch(fetch_options);
            } else {
                detail_model.set("destroy", false, {
                    silent: true
                });
                cb.call(this, detail_model);
            }
        },
        loadModel: function(detail_model_id, cb) {
            if (!detail_model_id) {
                detail_model_id = collections.article_summaries.instance.where({
                    in_drawer: true
                })[0].get("id");
            }
            if (!detail_model_id) {
                detail_model_id = collections.article_comparisons.instance.first().get("id");
            }
            if (detail_model_id) {
                this.detail.getDetailModelFromId.call(this, detail_model_id, cb);
                var summary_model = collections.article_summaries.instance.findWhere({
                    id: detail_model_id
                });
                if (summary_model) {
                    summary_model.set("selected_for_detail", true);
                }
            }
        }
    },
    saveHash: function() {
        var mode = models.section_mode.get("mode"), mode_collections = {
            compare: "article_comparisons",
            detail: "article_detailed"
        }, mode_collection = mode_collections[mode];
        var article_ids = collections[mode_collection].instance.getHash();
        routing.router.navigate(mode + "/" + article_ids);
    },
    showHideList: function(e) {
        var $btn = $(e.currentTarget), open = $btn.attr("data-open") == "true", $list = $btn.parents(".option-container").find(".tag-list"), slide_duration = 400, text;
        if (open) {
            $list.slideUp(slide_duration, "easeOutQuint");
            text = "Show";
        } else {
            $list.slideDown(slide_duration, "easeOutQuint");
            text = "Hide";
        }
        $btn.attr("data-open", !open).html(text);
    },
    moreSummaryArticles: function() {
        var current_page_size = views.po.article_summaries.page_size;
        views.po.article_summaries.page_size = current_page_size + 20;
        views.po.article_summaries.trigger("addToDrawer");
        return this;
    },
    setLoadMoreButton: function() {
        var po = views.po.article_summaries, total_length = po.all_cids.length, match_set_length = po.match_set.cids.length, page_size = po.page_size, $loadMore = this.$drawer.find(".load-more");
        var diff = match_set_length - page_size;
        if (diff > 0) {
            $loadMore.html("Showing " + page_size + " of " + match_set_length + " articles. Load more...").parent().removeClass("disabled").prop("disabled", false);
        } else if (page_size >= total_length) {
            $loadMore.html("Loaded all " + total_length + " articles.").parent().addClass("disabled").prop("disabled", true);
        } else {
            $loadMore.html("Showing " + match_set_length + " matching articles.").parent().addClass("disabled").prop("disabled", true);
        }
    },
    updateComparisonMarker: function(e) {
        var dimension = $('.alter-comparison-marker[data-which="dimension"]').val(), group = $('.alter-comparison-marker[data-which="group"]').val();
        collections.article_comparisons.instance.metadata("comparison-marker-dimension", dimension);
        collections.article_comparisons.instance.metadata("comparison-marker-group", group);
        collections.article_comparisons.instance.redrawMarkers();
        return this;
    },
    onScrollTick: function($content) {
        var that = this, stuck, buffer = 5, sticky_original_offset;
        var content_scrollHeight = $content[0].scrollHeight, content_scrollTop = $content.scrollTop();
        var $sticky = this.$el.find(".sticky");
        if ($sticky.length) {
            sticky_original_offset = +$sticky.attr("data-offset");
            if (content_scrollTop >= sticky_original_offset - buffer) {
                stuck = true;
            } else {
                stuck = false;
            }
            $sticky.toggleClass("stuck", stuck);
        }
    },
    goToDetail: function(e) {
        var article_id = $(e.currentTarget).attr("data-id");
        this.staged_article_detail = +article_id;
        var current_mode = models.section_mode.get("mode");
        if (current_mode != "detail") {
            models.section_mode.set("mode", "detail");
        } else {
            this.sectionMode.detail.call(this);
        }
        return this;
    }
});

app.Settings = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click button.add": "addItem",
        "click .destroy": "removeItem",
        "click #save": "saveDataToServer",
        sync: "saved"
    },
    initialize: function() {
        this.$drawer = $("#drawer");
        this.$content = $("#content");
        this.instantiate();
    },
    saved: function() {
        console.log("saved in view");
    },
    instantiate: function() {
        var markup = templates.settingsFactory(this.model.toJSON());
        this.$content.html(markup);
        this.initColorPicker(this.$content);
    },
    initColorPicker: function($el) {
        var that = this;
        $el.find(".color-picker").each(function() {
            var group = $(this).attr("data-group");
            $(this).spectrum({
                preferredFormat: "hex",
                showInput: true,
                showPalette: true,
                chooseText: "Choose",
                palette: [ that.palettes[group] ],
                change: function(color) {
                    $(this).val(color.toHexString());
                }
            });
        });
    },
    palettes: {
        subject: [ "#1f78b4", "#33a02c", "#e31a1c", "#ff7f00", "#6a3d9a", "#b15928", "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6" ],
        impact: [ "#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f" ]
    },
    addItem: function(e) {
        var $inputsContainer = $(e.currentTarget).siblings(".inputs-container"), new_item = {}, placeholders, $newItem;
        new_item.flag = $inputsContainer.attr("data-flag");
        new_item.group = $inputsContainer.attr("data-group");
        new_item.keys = [];
        $inputsContainer.find(".input-item").each(function() {
            new_item.keys.push($(this).attr("data-key"));
        });
        if ($inputsContainer.attr("data-layout") == "double") {
            placeholders = JSON.parse($inputsContainer.attr("data-placeholder"));
            new_item.keys = JSON.parse($inputsContainer.attr("data-child-keys"));
            new_item.placeholder0 = placeholders[0];
            new_item.placeholder1 = placeholders[1];
            $inputsContainer.append(templates.multiInputDoubleFactory(new_item));
        } else if ($inputsContainer.attr("data-layout") == "impact-tags") {
            new_item.placeholder = $inputsContainer.attr("data-placeholder");
            $newItem = $(templates.impactTagInputFactory(new_item));
            $newItem.appendTo($inputsContainer);
            this.initColorPicker($newItem);
        } else if ($inputsContainer.attr("data-child-keys")) {
            new_item.placeholder = $inputsContainer.attr("data-placeholder");
            new_item.keys = JSON.parse($inputsContainer.attr("data-child-keys"));
            $newItem = $(templates.multiInputFactory(new_item));
            $newItem.appendTo($inputsContainer);
            if (new_item.flag == "color") {
                this.initColorPicker($newItem);
            }
        } else {
            new_item.placeholder = $inputsContainer.attr("data-placeholder");
            $newItem = $(templates.singleInputFactory(new_item));
            $newItem.appendTo($inputsContainer);
        }
    },
    removeItem: function(e) {
        var $thisInput = $(e.currentTarget).parents("li.input.multi");
        $thisInput.remove();
    },
    saveDataToServer: function() {
        var settings = this.getSettingsData();
        var valid = this.validateSettings(settings);
        var existing_keys = Object.keys(settings), desired_keys = [ "rss_feeds", "twitter_staff_lists", "twitter_users", "subject_tags", "impact_tags" ];
        var missing_keys = _.difference(desired_keys, existing_keys);
        missing_keys.forEach(function(missingKey) {
            settings[missingKey] = [];
        });
        var $submitMsg = $(".submit-msg");
        if (valid) {
            console.log("Posting settings...", settings);
            this.model.save(settings, {
                error: function(model, response, options) {
                    console.log("error in model save", response);
                    $submitMsg.addClass("fail").html("Failed!");
                },
                success: function(model, response, options) {
                    console.log("saved in model save", response);
                    $submitMsg.addClass("success").html("Saved! Refreshing...");
                    setTimeout(function() {
                        window.location.reload();
                    }, 300);
                }
            });
        } else {
            $submitMsg.addClass("fail").html("Passwords do not match. Please try again.");
        }
    },
    getSettingsData: function() {
        var settings = {}, $inputContainers = this.$el.find(".inputs-container");
        $inputContainers.each(function(i) {
            var $this = $(this), key = $this.attr("data-key"), $inputs = $this.find(".input"), input_val;
            if (!$inputs.hasClass("multi")) {
                input_val = $inputs.find(".input-item").val();
                if (input_val && input_val.trim()) {
                    settings[key] = input_val.trim();
                }
            } else {
                $inputs.each(function() {
                    var input_obj = {}, val_collection = [];
                    $(this).find(".input-item").each(function() {
                        var $this = $(this), input_key = $this.attr("data-key");
                        var val, type = $this.attr("type");
                        if (type == "radio" || type == "checkbox") {
                            val = $this.prop("checked");
                        } else {
                            val = $this.val();
                        }
                        if (typeof val == "string") val = val.trim();
                        if (input_key) {
                            input_obj[input_key] = val;
                            if ($this.attr("data-id")) {
                                var id = $this.attr("data-id");
                                if (id === "false") id = null;
                                input_obj["id"] = parseFloat(id);
                            }
                        } else {
                            input_obj = val;
                        }
                        val_collection.push(val);
                    });
                    if (!_.some(val_collection, function(d) {
                        return _.isEmpty(d) && !_.isBoolean(d);
                    })) {
                        if (!settings[key]) settings[key] = [];
                        settings[key].push(input_obj);
                    }
                });
            }
        });
        return settings;
    },
    reportError: function(msg) {
        return false;
    },
    validateSettings: function(settings) {
        if (settings.password) {
            if (!_.isEqual(settings.password[0], settings.password[1])) {
                this.reportError("Passwords do not match");
                return false;
            } else {
                settings.password = settings.password[0];
            }
        }
        return true;
    }
});

app.helpers = {
    drawer: {
        determineBehavior: function() {
            var behavior = "radio";
            if (models.section_mode.get("mode") == "compare") {
                behavior = "checkbox";
            }
            return behavior;
        },
        getAllIds: function() {
            var ids = [];
            _.each(this.drawerData, function(drawerDatum) {
                ids.push(drawerDatum[this.listId]);
            }, this);
            return ids;
        }
    },
    isotope: {
        initCntnr: function() {
            this.$isotopeCntnr = this.$listContainer;
            this.$isotopeCntnr.isotope({
                itemSelector: this.isotopeChild,
                masonry: {
                    columnWidth: 400
                },
                getSortData: {
                    title: "[data-title]",
                    timestamp: "[data-timestamp] parseFloat",
                    twitter: "[data-twitter] parseFloat",
                    facebook: "[data-facebook] parseFloat",
                    pageviews: "[data-pageviews] parseFloat",
                    avg_time_on_page: "[data-avg_time_on_page] parseFloat",
                    per_internal: "[data-per_internal] parseFloat",
                    per_external: "[data-per_external] parseFloat",
                    subject: "[data-subject-tags] parseFloat",
                    impact: "[data-impact-tags] parseFloat"
                }
            });
        },
        clearCntnr: function() {
            if (this.$isotopeCntnr) this.$isotopeCntnr = null;
        },
        addItem: function($el) {
            this.$isotopeCntnr.isotope("appended", $el);
        },
        relayout: function(sortBy, sortAscending) {
            sortBy = sortBy || "timestamp";
            if (_.isUndefined(sortAscending)) {
                sortAscending = false;
            }
            app.instance.$isotopeCntnr.isotope({
                sortBy: sortBy,
                sortAscending: sortAscending
            });
            app.instance.$isotopeCntnr.isotope("layout");
        }
    }
};

Backbone.View.prototype.killView = function() {
    if (this._time_picker) {
        this._time_picker.destroy();
    }
    this.killAllSubviews();
    this.undelegateEvents();
    this.remove();
};

Backbone.View.prototype.killAllSubviews = function() {
    if (this._subviews && _.isArray(this._subviews)) {
        this._subviews.forEach(function(subview) {
            subview.killView();
        });
        this._subviews = [];
    }
};

views.AA_BaseArticleViz = Backbone.View.extend({
    tagName: "section",
    className: "article-detail-viz-container",
    setMarkup: function() {
        this.setTitle();
        this.setContainer();
    },
    setTitle: function() {
        this.$el.html('<h3 class="title">' + this.section_title + "</h3>");
        return this;
    },
    calcComparisonMarkerParams: function() {
        this.comparison_marker_dimension = collections.article_comparisons.instance.metadata("comparison-marker-dimension");
        this.comparison_marker_group = collections.article_comparisons.instance.metadata("comparison-marker-group");
        return this;
    },
    setContainer: function() {
        this.$vizContainer = $('<div class="viz-container"></div>').appendTo(this.$el);
        return this;
    },
    fancyPercent: function(decimal) {
        if (decimal < .01) {
            return "<1%";
        } else {
            return Math.round(decimal * 100) + "%";
        }
    },
    render: function(renderMarker) {
        var that = this;
        var vizContainer = this.$vizContainer.get(0);
        var d3_vizContainer = d3.select(vizContainer);
        var _columns = d3_vizContainer.selectAll(".bar-container").data(this.data).enter();
        var bar_container = _columns.append("div").classed("bar-container", true);
        bar_container.append("div").classed("bar", true).style("width", function(d) {
            return (d.pageviews / that.total * 100).toFixed(2) + "%";
        });
        var bullet_markers;
        if (renderMarker) {
            bullet_markers = bar_container.append("div").classed("marker-container", true).style("left", function(d) {
                return that.calcLeftOffset(d.facet, that.comparison_marker_dimension);
            }).classed("tooltipped", true).attr("aria-label", function(d) {
                var dimension = helpers.templates.toTitleCase(that.comparison_marker_dimension);
                if (dimension == "Mean") {
                    dimension = "Average";
                }
                return dimension + " of " + that.comparison_marker_group + " articles: " + that.calcLeftOffset(d.facet, that.comparison_marker_dimension);
            }).attr("data-tooltip-align", function(d) {
                var leftOffset = parseInt(that.calcLeftOffset(d.facet, that.comparison_marker_dimension)), alignment = "center";
                if (leftOffset <= 20) {
                    alignment = "left";
                } else if (leftOffset > 75) {
                    alignment = "right";
                }
                return alignment;
            }).append("div").classed("marker", true);
        }
        bar_container.append("div").classed("label", true).html(function(d) {
            var percent = that.fancyPercent(d.pageviews / that.total), count = d.pageviews ? helpers.templates.addCommas(d.pageviews) : "";
            return "<strong>" + helpers.templates.toTitleCase(d.facet) + "</strong> &mdash; " + percent + ", " + count;
        });
        this.bar_container = bar_container;
        return this;
    },
    redrawMarker: function() {
        this.calcComparisonMarkerParams();
        var that = this;
        var markers = this.bar_container.selectAll(".marker-container").transition().duration(450).ease("exp-out").styleTween("left", function(d) {
            var starting_px = parseFloat(d3.select(this).style("left")), parent_px = this.parentNode.offsetWidth, starting_percent = starting_px / parent_px * 100, ending_percent = that.calcLeftOffset(d.facet, that.comparison_marker_dimension), ending_pixel = parseFloat(ending_percent) * parent_px;
            return d3.interpolate(starting_percent, ending_percent);
        }).attr("aria-label", function(d) {
            return helpers.templates.toTitleCase(that.comparison_marker_dimension) + " of " + that.comparison_marker_group + " articles: " + that.calcLeftOffset(d.facet, that.comparison_marker_dimension);
        });
    },
    calcLeftOffset: function(metric, val, group) {
        group = group || this.comparison_marker_group;
        var group_metric = pageData.articleComparisons[group], offset_percent = -999, this_metrics_info = _.findWhere(pageData.articleComparisons[group], {
            metric: "per_" + metric
        }), max, scale;
        if (group_metric && this_metrics_info) {
            max = 1;
            scale = d3.scale.linear().domain([ 0, max ]).range([ 0, 100 ]);
            if (typeof val == "string") {
                val = this_metrics_info[val];
            }
            offset_percent = Math.round(scale(val));
        } else {
            console.error("ERROR: " + group + " is not a comparison value in `pageData.articleComparisons` or per_" + metric + " does not exist as a metric in that group.");
        }
        return offset_percent.toString() + "%";
    }
});

views.AA_BaseForm = Backbone.View.extend({
    events: {
        "click .modal-overlay": "toggleModal",
        "click .modal-close": "toggleModal",
        "click .article-assignee": "removeArticleAssignee",
        "change select": "recordDropdownChange",
        "change input": "recordInputChange",
        "change textarea": "recordInputChange"
    },
    killPropagation: function(e) {
        e.stopPropagation();
    },
    toggleModal: function(e) {
        e.stopPropagation();
        views.helpers.toggleModal(e);
    },
    assignmentTemplateFactory: _.template('<div class="article-assignee" data-value="<%= id %>"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span></div>'),
    bakeModal: function(title) {
        var modal_markup = "";
        modal_markup += '<div class="modal-outer">';
        modal_markup += '<div class="modal-overlay"></div>';
        modal_markup += '<div class="modal-inner">';
        modal_markup += '<div class="modal-title">' + title + "</div>";
        modal_markup += "<form></form>";
        modal_markup += "</div>";
        modal_markup += "</div>";
        this.$el.append(modal_markup);
        this.$form = this.$el.find("form");
        return this;
    },
    refresh: function() {
        this.render();
        this.postRender();
    },
    postRender: function(disableTitleSearch, disablePikaday) {
        if (!disableTitleSearch) {
            this.initArticleTitleSearcher();
        }
        if (!disablePikaday) {
            this.initPikaday();
        }
        this.$submitMsgText = this.$el.find(".submit-msg");
        d3.select(this.el).call(this.drag);
        return this;
    },
    bakeFormInputRow: function(fieldName, data) {
        var type = data.type, field_name_pp = this.prettyName(fieldName), markup = "", has_help_link = data.help && data.help.link, banished_fields = [ "Requires approval" ];
        if (!_.contains(banished_fields, field_name_pp)) {
            markup = '<div class="form-row">';
            markup += '<div class="form-row-label-container ' + (has_help_link ? "has-help-link" : "") + '">';
            markup += '<label for="' + fieldName + '"> ' + field_name_pp + "</label> ";
            markup += "</div>";
            markup += '<div class="form-row-input-container" data-which="' + fieldName + '">';
            if (has_help_link) markup += '<div class="help-row"><a href="' + data.help.link + '" target="_blank">What do I put here?</a></div>';
            markup += this.formJsonToMarkup[type].call(this, fieldName, data);
            markup += "</div>";
            markup += "</div>";
        }
        return markup;
    },
    formJsonToMarkup: {
        "article-search": function(fieldName, data) {
            fieldName = "assignees-selector";
            var input_markup;
            input_markup = '<input type="text" name="' + fieldName + '" class="' + fieldName + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '"/>';
            return input_markup;
        },
        article_assignees: function(assignees) {
            var markup = "";
            assignees.forEach(function(assignee) {
                markup += this.assignmentTemplateFactory(assignee);
            }, this);
            return markup;
        },
        timestamp: function(fieldName, data) {
            var value, input_markup;
            input_markup = '<input type="text" name="' + fieldName + '" class="' + fieldName + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '"/>';
            return input_markup;
        },
        text: function(fieldName, data) {
            var value = this.escapeQuotes(data.selected) || "", input_markup = '<input type="text" name="' + fieldName + '" class="' + fieldName + '" value="' + value + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '"/>';
            return input_markup;
        },
        paragraph: function(fieldName, data) {
            var value = this.escapeQuotes(data.selected) || "", input_markup = '<textarea type="text" name="' + fieldName + '" class="' + fieldName + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '">' + value + "</textarea>";
            return input_markup;
        },
        select: function(fieldName, data) {
            var input_markup = '<select id="' + fieldName + '" name="' + fieldName + '">';
            _.each(data.options, function(option) {
                var selected = "";
                if (data.selected == option) selected = "selected";
                input_markup += '<option value="' + option + '" ' + selected + ">" + this.prettyName(option) + "</option>";
            }, this);
            input_markup += "</select>";
            return input_markup;
        },
        checkbox: function(fieldName, data) {
            var input_markup = "", namespacer = "NewsLynx";
            _.each(data.options, function(checkboxItemObj) {
                var style = this.styleCheckboxLabel(checkboxItemObj);
                var checkboxId = _.uniqueId(namespacer + "|" + fieldName + "|" + checkboxItemObj.id + "|");
                input_markup += '<div class="form-checkbox-group tags">';
                var checked = "";
                var selected_ids = _.pluck(data.selected, "id");
                if (_.contains(selected_ids, checkboxItemObj.id)) checked = "checked";
                input_markup += '<input class="tag" id="' + checkboxId + '" name="' + fieldName + '" data-value="' + checkboxItemObj.id + '" type="checkbox" ' + checked + "/>";
                input_markup += '<label class="tag" for="' + checkboxId + '" ' + style + ">" + checkboxItemObj.name + "</label>";
                input_markup += "</div>";
            }, this);
            return input_markup;
        }
    },
    styleCheckboxLabel: function(checkboxItemObj) {
        var bgColor = checkboxItemObj.color, color = this.whiteOrBlack(bgColor);
        return 'style="background-color:' + bgColor + ";color:" + color + ';"';
    },
    prettyName: function(name) {
        var name_changes = {
            q: "search_query",
            assignees: "assignee(s)",
            url: "RSS URL",
            filter: "search_query"
        };
        if (name_changes[name]) name = name_changes[name];
        name = name.replace(/_/g, " ");
        return name.charAt(0).toUpperCase() + name.slice(1);
    },
    escapeQuotes: function(term) {
        if (!term) {
            return false;
        }
        if (typeof term !== "string") {
            return term;
        }
        return term.replace(/"/g, "&quot;");
    },
    prettyTimestamp: function(utcDate) {
        return new Date(utcDate * 1e3).toLocaleString();
    },
    initArticleTitleSearcher: function() {
        var $typeahead = this.$el.find(".assignees-selector"), that = this;
        this.$typeaheadRow = $typeahead.parents(".form-row");
        $('<div class="form-row article-assignees" ></div>').insertAfter(this.$typeaheadRow);
        $typeahead.typeahead({
            highlight: true
        }, {
            name: "articles",
            displayKey: "title",
            source: app.bloodhound.ttAdapter()
        });
        $typeahead.on("typeahead:selected", function(e, d) {
            e.preventDefault();
            $(this).typeahead("val", "");
            that.addArticleAssignee(d);
        });
        if (_.isArray(this.event_schema.assignees.selected)) {
            this.event_schema.assignees.selected.forEach(function(assignee) {
                that.addArticleAssignee(assignee);
            });
        }
        return this;
    },
    addArticleAssignee: function(d) {
        var $articleAssignments = this.$el.find(".form-row.article-assignees"), id = d.id;
        if (!_.contains(this.event_data.assignees, id)) {
            this.event_data.assignees.push(id);
            var markup = this.assignmentTemplateFactory(d);
            $articleAssignments.append(markup);
        }
        return this;
    },
    removeArticleAssignee: function(e) {
        var $cntnr = $(e.currentTarget), val = +$cntnr.attr("data-value");
        this.event_data.assignees = _.without(this.event_data.assignees, val);
        $(e.currentTarget).remove();
        return this;
    },
    initPikaday: function() {
        var time_picker, that = this, el = this.$el.find('input[name="timestamp"]')[0];
        time_picker = new Pikaday({
            field: el,
            clearInvalidInput: true,
            onSelect: function() {
                var this_date = this.getDate(), timestamp = this_date.getTime();
                that.event_data.timestamp = timestamp / 1e3;
            },
            onClear: function() {
                that.event_data.timestamp = null;
            }
        });
        if (this.event_schema && this.event_schema.timestamp && this.event_schema.timestamp.selected) {
            time_picker.setDate(new Date(this.event_schema.timestamp.selected * 1e3));
            this.event_data.timestamp = this.event_schema.timestamp.selected;
        }
        this._time_picker = time_picker;
        return this;
    },
    whiteOrBlack: function(bgColorHex) {
        var rgbColor = this.hexToRgb(bgColorHex);
        var r = rgbColor.r, g = rgbColor.g, b = rgbColor.b;
        var yiq = (r * 299 + g * 587 + b * 114) / 1e3;
        return yiq >= 128 ? "black" : "white";
    },
    hexToRgb: function(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    bakeButtons: function(includeDelete) {
        var markup = '<div class="buttons-container">';
        markup += '<button class="cancel modal-close">Cancel</button>';
        markup += '<input class="save" type="submit" value="Save"/>';
        markup += '<span class="submit-msg"></span>';
        if (includeDelete) {
            markup += '<input class="destroy" type="button" value="Delete"/>';
        }
        markup += "</div>";
        return markup;
    },
    recordDropdownChange: function(e) {
        var $select = $(e.currentTarget), key = $select.attr("name"), val = $select.val();
        this.event_data[key] = val;
        return this;
    },
    recordInputChange: function(e) {
        var $input = $(e.currentTarget), key = $input.attr("name"), type = $input.attr("type"), val, action, is_enabled;
        if (name == "timestamp") {
            val = +$input.attr("data-value");
            action = "set";
        } else if (type == "checkbox") {
            is_enabled = $input.prop("checked") == true;
            if (is_enabled) {
                action = "push";
            } else {
                action = "remove";
            }
            val = +$input.attr("data-value");
        } else if (type == "text") {
            val = $input.val();
            action = "set";
        } else {
            console.error("Uncaught form field. Won't save record for " + name, val);
        }
        if (action == "set") {
            this.event_data[key] = val;
        } else if (action == "push") {
            if (!_.contains(this.event_data[key], val)) {
                this.event_data[key].push(val);
            }
        } else if (action == "remove") {
            this.event_data[key] = _.without(this.event_data[key], val);
        }
        return this;
    },
    combineFormSchemaWithVals: function(schema_obj, settings_obj) {
        _.each(settings_obj, function(setting, fieldName) {
            if (!schema_obj[fieldName]) console.log(schema_obj, fieldName);
            var selected_array = schema_obj[fieldName].selected || [];
            if (fieldName != "impact_tags" && fieldName != "assignees") {
                schema_obj[fieldName].selected = setting;
            } else {
                schema_obj[fieldName].selected = selected_array.concat(setting);
            }
        });
        return schema_obj;
    },
    validate: function(requiredKeys, cb) {
        var event_data = this.event_data;
        var existing_keys = _.keys(event_data), existing_vals = _.values(event_data), msg, missing_keys = [], s = "";
        missing_keys.push(_.difference(requiredKeys, existing_keys));
        _.each(event_data, function(existingVal, existingKey) {
            if (!existingVal) {
                missing_keys.push(existingKey);
            } else if (typeof existingVal != "number") {
                var length = existingVal.length;
                if (length == 0) {
                    missing_keys.push(existingKey);
                }
            }
        });
        missing_keys = _.flatten(missing_keys);
        missing_keys = _.intersection(requiredKeys, missing_keys);
        if (missing_keys.length > 0) {
            if (missing_keys.length > 1) {
                s = "s";
            }
            missing_keys = missing_keys.map(function(missingKey) {
                return '"' + helpers.templates.toTitleCase(missingKey).replace(/_/g, " ") + '"';
            }).join(", ");
            msg = "You didn't include information for the required field" + s + ": " + missing_keys + ".";
            cb.call(this, "missing fields", msg);
        } else {
            cb.call(this, null, "Saving!");
        }
    },
    printMsgOnSubmit: function(error, msg) {
        var class_name = "success";
        if (error) class_name = "fail";
        this.$submitMsgText.removeClass("success").removeClass("fail");
        this.$submitMsgText.addClass(class_name).html(msg);
    },
    drag: d3.behavior.drag().on("drag", function(d, i) {
        var focused_inputs = $("input:focus").length;
        if (!focused_inputs) {
            var D3_modal_inner = d3.select(this).select(".modal-inner"), top = parseInt(D3_modal_inner.style("top")), left = parseInt(D3_modal_inner.style("left"));
            top += d3.event.dy;
            left += d3.event.dx;
            D3_modal_inner.style("top", top + "px").style("left", left + "px");
        }
    })
});

views.AA_BaseTag = Backbone.View.extend({
    whiteOrBlack: function(bgColorHex) {
        var rgbColor = this.hexToRgb(bgColorHex);
        var r = rgbColor.r, g = rgbColor.g, b = rgbColor.b;
        var yiq = (r * 299 + g * 587 + b * 114) / 1e3;
        return yiq >= 128 ? "black" : "white";
    },
    hexToRgb: function(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    colorLuminance: function(hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, "");
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }
});

views.Alert = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper modal-parent",
    events: {
        'click .approval-btn-container[data-which="no"]': "makeInsignificant",
        'click .approval-btn-container[data-which="yes"]': "toggleModal",
        "submit form": "createEvent"
    },
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy);
        this._subviews = [];
        this._time_picker;
        this.typeaheadInputId = "assignees-selector";
    },
    render: function() {
        var model_json = this.model.toJSON();
        var river_item_markup = templates.alertFactory(_.extend(model_json, helpers.templates));
        this.$el.html(river_item_markup);
        this.$form = this.$el.find("form");
        this.postRender();
        return this;
    },
    postRender: function() {
        this.bakeEventCreator();
    },
    bakeEventCreator: function() {
        var event_creator_view = new views.EventCreatorFromAlert({
            el: this.el,
            model: this.model.toJSON()
        });
        this._subviews.push(event_creator_view);
        this._time_picker = event_creator_view.time_picker;
        this.$el.append(event_creator_view.el);
        this.event_creator_view = event_creator_view;
        event_creator_view.$el.find(".form-row-input-container select,.form-row-input-container input,.form-row-input-container textarea").each(function(i, el) {
            var $el = $(el), is_timestamp = $el.hasClass("timestamp");
            if (!is_timestamp) {
                $el.trigger("change");
            }
        });
    },
    toggleModal: function(e) {
        views.helpers.toggleModal(e);
    },
    createEvent: function(e) {
        e.preventDefault();
        var that = this;
        var settings_obj = this.event_creator_view.getSettings();
        var new_event_model = new models.event.Model();
        console.log("settings", settings_obj);
        var required_keys = [ "timestamp", "assignees", "title", "impact_tags" ];
        var this_right_here = this;
        this.event_creator_view.validate(required_keys, function(error, description) {
            var that = this;
            if (!error) {
                new_event_model.save(settings_obj, {
                    error: function(model, response, options) {
                        console.log("error in event creation", response);
                        that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
                    },
                    success: function(model, response, options) {
                        console.log("saved event", response);
                        views.helpers.toggleModal(e);
                        this_right_here.removeItem("save");
                    }
                });
            } else {
                this.printMsgOnSubmit(error, description);
            }
        });
    },
    makeInsignificant: function(itemModel) {
        var that = this;
        this.model.set("making_insignificant", true);
        this.model.destroy({
            success: function(model, response) {
                that.removeItem("delete");
            },
            error: function(error) {
                console.log("Error deleting event.", error);
            }
        });
    },
    removeItem: function(mode) {
        this.model.set("destroy", mode);
    },
    destroy: function(model, destroyMode) {
        var making_insignificant = model.get("making_insignificant");
        if (destroyMode == "remove" && !making_insignificant) {
            this.killView();
        } else if (destroyMode == "delete") {
            console.log("delete");
            this.removeAlertColorfully("delete");
        } else if (destroyMode == "save") {
            this.removeAlertColorfully("save");
        }
    },
    removeAlertColorfully: function(mode) {
        var animation_duration = 650;
        var that = this, color;
        if (mode == "save") {
            color = "#D0F1D1";
        } else if (mode == "delete") {
            color = "#FFD0D0";
        }
        this.$el.css("background-color", color).fadeOut(500).delay(500).queue(function(next) {
            onAnimationEnd.call(that);
        });
        function onAnimationEnd() {
            this.event_creator_view._time_picker.destroy();
            this.killView();
        }
    }
});

views.ArticleComparisonGrid = Backbone.View.extend({
    tagName: "div",
    className: "compare-grid-container",
    events: {
        "click .header-el": "sortColumn"
    },
    initialize: function() {
        var that = this;
        this.sortAscending = collections.article_comparisons.instance.metadata("sort_ascending");
        this.listenTo(collections.article_comparisons.instance, "resetMetricHeaders", this.setMetricHeaders);
        views.po.article_summaries.on("sortChange", function(e, d, i) {
            var metric_arr = this.current_sort.name.split("_"), metric = metric_arr.slice(0, metric_arr.length - 1).join("_");
            var crossover = {
                twitter_mentions: "twitter",
                facebook_likes: "facebook",
                subject_tags: "subject",
                impact_tags: "impact"
            };
            var crossover_metric = crossover[metric];
            if (crossover_metric) {
                metric = crossover_metric;
            }
            that.sortFromPourOver.call(that, metric);
        });
        this.calcComparisonMarkerParams();
        var quant_metrics = [ "twitter", "facebook", "pageviews", "avg_time_on_page", "per_external" ];
        this.quant_metrics = this.hydrateMetrics(quant_metrics);
        return this;
    },
    sortFromPourOver: function(metric) {
        this.sortAscending = false;
        if (metric == "per_internal") {
            this.sortAscending = true;
            metric = "per_external";
        }
        this.sortBy(metric);
        return this;
    },
    render: function() {
        var grid_markup = templates.articleGridContainerMarkup;
        this.$el.html(grid_markup);
        this.setMetricHeaders();
        return this;
    },
    hydrateMetrics: function(quantMetrics) {
        var group = this.comparison_marker_group;
        var metric_maxes = pageData.articleComparisons[group].filter(function(metricMax) {
            return quantMetrics.indexOf(metricMax.metric) != -1;
        });
        metric_maxes.sort(function(a, b) {
            return quantMetrics.indexOf(a.metric) - quantMetrics.indexOf(b.metric);
        });
        return metric_maxes;
    },
    sortColumn: function(e) {
        var $this = $(e.currentTarget);
        if ($this.hasClass("active")) {
            this.sortAscending = !this.sortAscending;
        }
        var metric = $this.attr("data-metric");
        this.sortBy(metric);
        return this;
    },
    sortBy: function(metric) {
        $(".header-el").removeClass("active");
        $('.header-el[data-metric="' + metric + '"]').addClass("active");
        app.instance.$isotopeCntnr.isotope({
            sortBy: metric,
            sortAscending: this.sortAscending
        });
        collections.article_comparisons.instance.metadata("sort_ascending", this.sortAscending);
        collections.article_comparisons.instance.metadata("sort_by", metric);
        collections.article_comparisons.instance.comparator = function(articleComparison) {
            return articleComparison.get(metric);
        };
        if (!this.sortAscending) {
            collections.article_comparisons.instance.comparator = this.reverseSortBy(collections.article_comparisons.instance.comparator);
        }
        collections.article_comparisons.instance.sort();
        $(".header-el").attr("data-sort-ascending", this.sortAscending);
    },
    reverseSortBy: function(sortByFunction) {
        return function(left, right) {
            var l = sortByFunction(left);
            var r = sortByFunction(right);
            if (l === void 0) return -1;
            if (r === void 0) return 1;
            return l < r ? 1 : l > r ? -1 : 0;
        };
    },
    calcComparisonMarkerParams: function() {
        this.comparison_marker_dimension = collections.article_comparisons.instance.metadata("comparison-marker-dimension");
        this.comparison_marker_group = collections.article_comparisons.instance.metadata("comparison-marker-group");
        this.comparison_marker_max = collections.article_comparisons.instance.metadata("comparison-marker-max");
        return this;
    },
    setMetricHeaders: function() {
        this.calcComparisonMarkerParams();
        var dimension = this.comparison_marker_dimension, group = this.comparison_marker_group, display_dimension = dimension;
        this.quant_metrics.forEach(function(quantMetric) {
            var metric = quantMetric.metric, $header_el = this.$el.find('.header-el[data-metric="' + metric + '"] .comparison-figure'), value = quantMetric[dimension];
            if (metric == "per_external") {
                value = Math.round(value * 100) + "%";
            } else {
                value = Math.round(value);
            }
            if (dimension == "mean") {
                display_dimension = "average";
            }
            display_dimension = helpers.templates.toTitleCase(display_dimension);
            $header_el.html(value).attr("aria-label", display_dimension + " of " + group + " articles.");
        }, this);
    }
});

views.ArticleDetail = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper",
    events: {
        "click .tab": "setActiveTabFromClick",
        "click .modal-toggle": "toggleModal",
        "click .modal-close": "toggleModal"
    },
    initialize: function() {
        this._subviews = [];
        this.listenTo(this.model, "change:destroy", this.destroyView);
        this.article_detailed_events_collection = new collections.article_detailed_events.Collection();
        this.listenTo(this.article_detailed_events_collection, "add", this.eventsGallery.add);
        this.listenTo(this.article_detailed_events_collection, "remove", this.eventsGallery.remove);
        this.listenTo(collections.article_detailed_subject_tags.instance, "add", this.subject_tags.add);
        this.listenTo(collections.article_detailed_subject_tags.instance, "remove", this.subject_tags.remove);
        this.listenTo(collections.article_detailed_impact_tags.instance, "add", this.impact_tags.add);
        this.listenTo(collections.article_detailed_impact_tags.instance, "remove", this.impact_tags.remove);
        this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, "add", this.impact_tag_attribute.add);
        this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, "remove", this.impact_tag_attribute.remove);
        this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, "add", this.impact_tag_attribute.add);
        this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, "remove", this.impact_tag_attribute.remove);
        var article_impact_tags = this.model.get("impact_tags_full"), article_impact_tag_categories = this.model.get("impact_tag_categories"), article_impact_tag_levels = this.model.get("impact_tag_levels");
        this.articles_impact_tags_collection = new collections.impact_tags.Collection(article_impact_tags);
        this.articles_impact_tag_categories_collection = new collections.impact_tag_attributes.Collection(article_impact_tag_categories);
        this.articles_impact_tag_levels_collection = new collections.impact_tag_attributes.Collection(article_impact_tag_levels);
        this.articles_impact_tags_collection.metadata("po_collection", "article_detailed_events");
        this.articles_impact_tag_categories_collection.metadata("po_collection", "article_detailed_events");
        this.articles_impact_tag_levels_collection.metadata("po_collection", "article_detailed_events");
        this.articles_impact_tag_categories_collection.metadata("filter", "impact_tag_categories");
        this.articles_impact_tag_levels_collection.metadata("filter", "impact_tag_levels");
        var events_data = this.model.get("events");
        var promotions_data = this.model.get("promotions");
        collections.po.article_detailed_events = new PourOver.Collection(events_data);
        collections.po.article_detailed_events.addFilters([ collections.po.filters.impact_tags, collections.po.filters.impact_tag_categories, collections.po.filters.impact_tag_levels, collections.po.filters.timestamps ]);
        collections.po.article_detailed_events.addSorts([ collections.po.sorts.timestamp_desc ]);
        views.po.article_detailed_events = new PourOver.View("article_detailed_events_view", collections.po.article_detailed_events);
        views.po.article_detailed_events.setSort("timestamp_desc2");
        var that = this;
        views.po.article_detailed_events.on("update", function() {
            that.eventsGallery.setActiveEvents.call(that);
        });
        this.chartSelector = "#ST-chart";
        this.legend = {
            facebook_share_count: {
                service: "Facebook",
                metric: "shares",
                color: "#3B5998",
                group: "a"
            },
            twitter_count: {
                service: "Twitter",
                metric: "mentions",
                color: "#55ACEE",
                group: "a"
            },
            pageviews: {
                service: "",
                metric: "pageviews",
                color: "#FF7F0E",
                group: "b"
            }
        };
        this.filterEventsByDateRange_throttled = _.throttle(this.filterEventsByDateRange, 100);
        this.timeseriesData = this.model.getTimeSeriesStats();
        var that = this;
        this.spottedTail = spottedTail().timezone(pageData.timezone).y(function(d) {
            return +d.count;
        }).legend(this.legend).events(events_data).promotions(promotions_data).interpolate("step-after").onBrush(this.filterEventsByDateRange_throttled);
        this.onWindowResize_throttled = _.throttle(this.onWindowResize, 200);
        $(window).resize(function() {
            that.onWindowResize_throttled.call(that);
        });
    },
    render: function() {
        console.log(this.model.toJSON());
        var article_detail_markup = templates.articleDetailFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(article_detail_markup);
        return this;
    },
    bakeInteractiveBits: function() {
        var that = this;
        this.$eventCreator = $("#event-creator-container");
        this.$subjectTagsContainer = this.$el.find('.article-info-container[data-which="subject"] ul.tags');
        this.$impactTagsContainer = this.$el.find('.article-info-container[data-which="impact"] ul.tags');
        this.$impactTagCategoriesContainer = this.$el.find('.article-info-container[data-which="impact-categories"] ul.tags');
        this.$impactTagLevelsContainer = this.$el.find('.article-info-container[data-which="impact-levels"] ul.tags');
        this.$editSubjectTagsContainer = this.$el.find("#subject-tag-settings");
        this.$impactTagsList = this.$el.find('.option-container[data-type="impact-tags"] .tag-list');
        this.$impactTagCategoriesList = this.$el.find('.option-container[data-type="impact-tag-categories"] .tag-list');
        this.$impactTagLevelsList = this.$el.find('.option-container[data-type="impact-tag-levels"] .tag-list');
        this.$eventsContainer = this.$el.find("#events-gallery-container");
        this.bakeChart();
        this.bakeSubjectTags();
        this.bakeEventCreator();
        this.bakeEventsGalleryFilters();
        this.bakeArticleVizs();
        this.eventsGallery.setActiveEvents.call(this);
        this.setDetailNavigation();
        this.calcStickyOffsets();
        this.setActiveTab();
        return this;
    },
    bakeChart: function() {
        d3.select(this.chartSelector).datum(this.timeseriesData).call(this.spottedTail);
    },
    calcStickyOffsets: function() {
        var $sticky = this.$el.find(".sticky"), $sticky_anchor = this.$el.find(".sticky-anchor"), sticky_anchor_offset;
        if ($sticky.length && $sticky_anchor.length) {
            sticky_anchor_offset = $sticky_anchor.position().top + $("#content").scrollTop();
            $sticky.attr("data-offset", sticky_anchor_offset);
        }
        return this;
    },
    onWindowResize: function() {
        this.calcStickyOffsets();
    },
    bakeEventsGalleryFilters: function() {
        if (this.articles_impact_tags_collection.length) {
            this.$impactTagsList.html("");
            this.articles_impact_tags_collection.each(function(tagModel) {
                var tag_view = new views.Tag({
                    model: tagModel
                });
                this._subviews.push(tag_view);
                this.$impactTagsList.append(tag_view.render().el);
            }, this);
        }
        if (this.articles_impact_tag_categories_collection.length) {
            this.articles_impact_tag_categories_collection.each(function(tagModel) {
                this.$impactTagCategoriesList.html("");
                var tag_view = new views.Tag({
                    model: tagModel
                });
                this._subviews.push(tag_view);
                this.$impactTagCategoriesList.append(tag_view.render().el);
            }, this);
        }
        if (this.articles_impact_tag_levels_collection.length) {
            this.articles_impact_tag_levels_collection.each(function(tagModel) {
                this.$impactTagLevelsList.html("");
                var tag_view = new views.Tag({
                    model: tagModel
                });
                this._subviews.push(tag_view);
                this.$impactTagLevelsList.append(tag_view.render().el);
            }, this);
        }
        return this;
    },
    bakeArticleVizs: function() {
        var $articleVizsReadingContainer = this.$el.find('section.detail-section[data-group="reading"]');
        var $articleVizsTweetsContainer = this.$el.find('section.detail-section[data-group="tweeting"]');
        var referrer_metrics = this.model.get("referrer_metrics");
        var tweet_info = this.model.get("tweet_info");
        if (!_.isEmpty(referrer_metrics)) {
            $articleVizsReadingContainer.html("");
            var device_facet_view = new views.ArticleDetailVizDeviceFacet({
                title: "On which devices are people reading?",
                referrer_metrics: referrer_metrics,
                which: "device"
            });
            this._subviews.push(device_facet_view);
            var device_facet_markup = device_facet_view.render("marker-also").el;
            $articleVizsReadingContainer.append(device_facet_markup);
            var internal_external_facet_view = new views.ArticleDetailVizInternalExternal({
                title: "Is traffic internally or externally driven?",
                referrer_metrics: referrer_metrics,
                which: "internal-external"
            });
            this._subviews.push(internal_external_facet_view);
            var internal_external_facet_markup = internal_external_facet_view.render("marker-also").el;
            $articleVizsReadingContainer.append(internal_external_facet_markup);
            var domain_facet_view = new views.ArticleDetailVizDomainFacets({
                title: "Who's sending readers here?",
                referrer_metrics: referrer_metrics,
                which: "domain-referrers"
            });
            this._subviews.push(domain_facet_view);
            var domain_facet_markup = domain_facet_view.render().el;
            $articleVizsReadingContainer.append(domain_facet_markup);
            var domain_facet_view = new views.ArticleDetailVizArticleReferrers({
                title: "What articles link here?",
                referrer_metrics: referrer_metrics,
                which: "article-referrers"
            });
            this._subviews.push(domain_facet_view);
            var domain_facet_markup = domain_facet_view.render().el;
            $articleVizsReadingContainer.append(domain_facet_markup);
        }
        if (!_.isEmpty(tweet_info)) {
            $articleVizsTweetsContainer.html("");
            var tweets_view = new views.ArticleDetailVizTweets({
                title: "Who's tweeted this story?",
                tweet_info: tweet_info,
                which: "tweets"
            });
            this._subviews.push(tweets_view);
            var tweet_markup = tweets_view.render().el;
            $articleVizsTweetsContainer.append(tweet_markup);
        }
        return this;
    },
    eventsGallery: {
        add: function(eventModel) {
            var item_view, item_el;
            eventModel.set("in_selection", true);
            item_view = new views.ArticleDetailEvent({
                model: eventModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            this.$eventsContainer.append(item_el);
            return this;
        },
        remove: function(eventModel) {
            eventModel.set("in_selection", false);
            return this;
        },
        setActiveEvents: function() {
            var current_filtered_set = views.po.article_detailed_events.getCurrentItems();
            this.article_detailed_events_collection.set([]);
            this.article_detailed_events_collection.set(current_filtered_set);
        }
    },
    updateEventGalleryItems: function() {
        return this;
    },
    bakeSubjectTags: function() {
        var local_subject_tags_collection;
        var doesThisArticleHaveThisTag = function(tagName) {
            var this_articles_tag_names = collections.article_detailed_subject_tags.instance.pluck("name"), has_this_tag = _.contains(this_articles_tag_names, tagName), return_val = false;
            if (has_this_tag) {
                return_val = true;
            }
            return return_val;
        };
        var new_model_urlRoot = function() {
            var article_id = collections.article_detailed.instance.pluck("id")[0];
            return "/api/articles/" + article_id + "/subjects";
        };
        var subject_tags_full = this.model.get("subject_tags_full");
        var impact_tags_full = this.model.get("impact_tags_full");
        var impact_tag_categories = this.model.get("impact_tag_categories");
        var impact_tag_levels = this.model.get("impact_tag_levels");
        if (subject_tags_full.length) {
            this.$subjectTagsContainer.html("");
            collections.article_detailed_subject_tags.instance.set(subject_tags_full);
        } else {
            collections.article_detailed_subject_tags.instance.set([]);
        }
        if (impact_tags_full.length) {
            this.$impactTagsContainer.html("");
            collections.article_detailed_impact_tags.instance.set(impact_tags_full);
        } else {
            collections.article_detailed_impact_tags.instance.set([]);
        }
        if (impact_tag_categories.length) {
            this.$impactTagCategoriesContainer.html("");
            collections.article_detailed_impact_tag_attributes.categories_instance.set(impact_tag_categories);
        } else {
            collections.article_detailed_impact_tag_attributes.categories_instance.set([]);
        }
        if (impact_tag_levels.length) {
            this.$impactTagLevelsContainer.html("");
            collections.article_detailed_impact_tag_attributes.levels_instance.set(impact_tag_levels);
        } else {
            collections.article_detailed_impact_tag_attributes.levels_instance.set([]);
        }
        if (collections.subject_tags.instance.length) {
            this.$editSubjectTagsContainer.html('<div class="description">Add subject tags to this article.</div>');
            collections.subject_tags.instance.each(function(subjectTagModel) {
                var subject_tag_view, subject_tag_el, new_model = subjectTagModel.clone(), tag_selected = doesThisArticleHaveThisTag(new_model.get("name"));
                new_model.set("selected", tag_selected);
                new_model.urlRoot = new_model_urlRoot;
                subject_tag_view = new views.ArticleDetailAccountSubjectTag({
                    model: new_model
                });
                this._subviews.push(subject_tag_view);
                subject_tag_el = subject_tag_view.render().el;
                this.$editSubjectTagsContainer.append(subject_tag_el);
            }, this);
        }
    },
    subject_tags: {
        add: function(subjectTagModel) {
            var item_view, item_el;
            item_view = new views.ArticleDetailSubjectTag({
                model: subjectTagModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            this.$subjectTagsContainer.append(item_el);
            return this;
        },
        remove: function(subjectTagModel) {
            subjectTagModel.set("destroy", true);
            return this;
        }
    },
    impact_tags: {
        add: function(impactTagModel) {
            var item_view, item_el;
            item_view = new views.ArticleDetailImpactTag({
                model: impactTagModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            this.$impactTagsContainer.append(item_el);
            return this;
        },
        remove: function(subjectTagModel) {
            subjectTagModel.set("destroy", true);
            return this;
        }
    },
    impact_tag_attribute: {
        add: function(attributeModel, collection) {
            var item_view, item_el;
            var which_collection = collection.metadata("which"), containers = {
                categories: this.$impactTagCategoriesContainer,
                levels: this.$impactTagLevelsContainer
            }, container = containers[which_collection];
            item_view = new views.ArticleDetailAttributeTag({
                model: attributeModel
            });
            this._subviews.push(item_view);
            item_el = item_view.render().el;
            container.append(item_el);
            return this;
        },
        remove: function() {}
    },
    bakeEventCreator: function() {
        var assignee = {
            id: this.model.get("id"),
            title: this.model.get("title")
        };
        var defaults = {
            assignees: [ assignee ]
        };
        var event_creator_view = new views.EventCreator({
            defaults: defaults,
            el: this.$eventCreator[0]
        });
        this._subviews.push(event_creator_view);
        this._time_picker = event_creator_view.time_picker;
        return this;
    },
    filterEventsByDateRange: function(timestampRange, empty) {
        collections.po.article_detailed_events.filters.timestamp.clearQuery();
        if (!empty) {
            collections.po.article_detailed_events.filters.timestamp.intersectQuery(timestampRange);
        }
    },
    setActiveTab: function() {
        var group = collections.article_detailed.instance.metadata("selected-tab");
        var $tab = this.$el.find('.tab[data-group="' + group + '"]'), $target = $('.detail-section[data-group="' + group + '"]');
        this.$el.find(".tab").removeClass("active");
        $tab.addClass("active");
        $(".detail-section").hide();
        $target.show();
        return this;
    },
    setActiveTabFromClick: function(e) {
        var $tab = $(e.currentTarget), group;
        if (!$tab.hasClass("active")) {
            group = $tab.attr("data-group");
            collections.article_detailed.instance.metadata("selected-tab", group);
            this.setActiveTab();
        }
        return this;
    },
    setDetailNavigation: function() {
        var comparison_ids = collections.article_comparisons.instance.pluck("id"), this_id = this.model.id, this_id_index = comparison_ids.indexOf(this_id), $nav = this.$el.find(".article-detail-navigation"), $prev = $nav.find(".prev"), $next = $nav.find(".next"), $spacer = $nav.find(".spacer"), prev_model_index = this_id_index - 1, next_model_index = this_id_index + 1, prev_model, next_model, prev_title, next_title;
        if (this_id_index != -1) {
            if (this_id_index > 0) {
                prev_model = collections.article_comparisons.instance.at(prev_model_index);
                prev_title = helpers.templates.htmlDecode(prev_model.get("title"));
                $prev.html(" Prev").addClass("go-to-detail").attr("data-id", prev_model.id).attr("aria-label", prev_title).prepend('<span class="octicon octicon-chevron-left"></span>');
            }
            if (this_id_index < comparison_ids.length - 1) {
                next_model = collections.article_comparisons.instance.at(next_model_index);
                next_title = helpers.templates.htmlDecode(next_model.get("title"));
                $next.html("Next ").addClass("go-to-detail").attr("data-id", next_model.id).attr("aria-label", next_title).append('<span class="octicon octicon-chevron-right"></span>');
            }
        }
    },
    toggleModal: function(e) {
        views.helpers.toggleModal(e);
    },
    destroyView: function(model, destroyMode) {
        this.killView();
    }
});

views.ArticleDetailAccountSubjectTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    events: {
        change: "toggleChecked"
    },
    initialize: function() {
        this.listenTo(this.model, "change:checked", this.enableDisable);
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), helpers.templates);
        var tag_markup = templates.articleDetailAccountSubjectTagFactory(tag_data);
        this.$el.html(tag_markup);
        this.styleLayout();
        return this;
    },
    styleLayout: function() {
        var bg_color = this.model.get("color"), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.colorLuminance(bg_color, -.1);
        this.$el.find(".tag-text").css({
            "background-color": bg_color,
            color: text_color
        });
        return this;
    },
    toggleChecked: function() {
        var checked = this.$el.find("input").prop("checked");
        this.model.set("checked", checked);
    },
    enableDisable: function(model, enabledState) {
        var destroyable_model, article_detail_id, model_json = this.model.toJSON(), existing_models;
        if (enabledState) {
            this.model.save();
            existing_models = JSON.parse(JSON.stringify(collections.article_detailed_subject_tags.instance.models));
            existing_models.push(model_json);
            existing_models.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
            collections.article_detailed_subject_tags.instance.set(existing_models);
        } else {
            article_detail_id = collections.article_detailed.instance.pluck("id")[0];
            destroyable_model = new models.subject_tag.Model(model_json);
            destroyable_model.urlRoot = "/api/articles/" + article_detail_id + "/subjects";
            destroyable_model.destroy({
                wait: true
            });
            collections.article_detailed_subject_tags.instance.remove(model_json);
        }
    }
});

views.ArticleDetailAttributeTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    initialize: function() {
        this.styleLayout();
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), helpers.templates);
        var tag_markup = templates.articleDetailTagFactory(tag_data);
        this.$el.html(tag_markup);
        return this;
    },
    styleLayout: function() {
        var bg_color = this.model.get("color"), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.colorLuminance(bg_color, -.1);
        this.$el.css({
            "background-color": bg_color,
            color: text_color
        });
        return this;
    }
});

views.ArticleDetailEvent = Backbone.View.extend({
    className: "event-container",
    events: {
        "click input.destroy": "destroyEvent"
    },
    initialize: function() {
        this._subviews = [];
        var that = this;
        this.d3_el = d3.select(this.el);
        this.listenTo(this.model, "change:in_selection", this.killView);
        this.listenTo(this.model, "rerender", this.rerender);
    },
    rerender: function() {
        this.d3_el.select(".event-content").remove();
        this.render();
    },
    render: function() {
        var model_data = this.model.toJSON(), event_item;
        var _el = this.d3_el.selectAll(".event-content").data([ model_data ]).enter();
        var event_content = _el.append("div").classed("event-content", true);
        event_content.append("div").classed("event-timestamp", true).html(function(d) {
            return helpers.templates.prettyTimestamp(d.timestamp);
        });
        event_content.append("div").classed("event-title", true).html(function(d) {
            return d.title;
        });
        event_item = event_content.append("div").classed("event-item", true);
        event_item.append("div").classed("event-item-title", true).html("What happened?");
        event_item.append("div").classed("event-item-text", true).html(function(d) {
            return d.what_happened;
        });
        event_item = event_content.append("div").classed("event-item", true);
        event_item.append("div").classed("event-item-title", true).html("Why is this important?");
        event_item.append("div").classed("event-item-text", true).html(function(d) {
            return d.significance;
        });
        if (model_data.link) {
            event_item = event_content.append("div").classed("event-item", true);
            event_item.append("div").classed("event-item-title", true).html("Link");
            event_item.append("div").classed("event-item-text", true).html(function(d) {
                return '<a href="' + d.link + '" target="_blank">' + d.link + "</a>";
            });
        }
        event_item = event_content.append("div").classed("event-item", true);
        event_item.append("div").classed("event-item-title", true).html("Tags");
        var tags_container = event_item.append("ul").classed("event-tags-container", true).classed("tag-list", true);
        tags_container.selectAll(".tag").data(function(d) {
            return d.impact_tags_full;
        }).enter().append("li").classed("tag", true).classed("tooltipped", true).each(function(d) {
            var tag_model = new models.subject_tag.Model(d);
            var tag_view = new views.ArticleSummaryDrawerImpactTag({
                model: tag_model
            }), tag_markup = tag_view.render().$el.html(), tag_color = tag_view.getColor(), tag_label = tag_view.getLabel(), border_color = tag_view.getBorderColor();
            var d3_this = d3.select(this);
            d3_this.style("background-color", tag_color);
            d3_this.attr("aria-label", tag_label);
            d3_this.html(tag_markup);
        });
        var edit_event_btn_cntnr = event_content.append("div").classed("edit-event-container", true).classed("modal-parent", true);
        edit_event_btn_cntnr.append("button").classed("modal-toggle", true).classed("edit-event", true).classed("mini", true).html("Edit");
        var edit_event_btn_modal_outer = edit_event_btn_cntnr.append("div").classed("modal-outer", true);
        this.edit_event_btn_modal_outer = edit_event_btn_modal_outer;
        this.renderModal();
        return this;
    },
    renderModal: function() {
        var modal_outer = this.edit_event_btn_modal_outer;
        var all_data = this.model.toJSON();
        var assignee = {
            id: all_data.id,
            title: all_data.title
        };
        var defaults = {
            timestamp: all_data.timestamp,
            link: all_data.link,
            title: all_data.title,
            what_happened: all_data.what_happened,
            significance: all_data.significance,
            impact_tags: all_data.impact_tags_full
        };
        var event_creator_view = new views.EventEditor({
            defaults: defaults,
            el: modal_outer.node(),
            model: this.model
        });
        this._subviews.push(event_creator_view);
    },
    update: function(model, inSelection) {
        if (!inSelection) {
            this.killView();
        }
        return this;
    },
    destroyEvent: function() {
        var that = this;
        this.model.destroy({
            success: function(model, response) {
                that.killView();
            },
            error: function(error) {
                console.log("Error deleting event.", error);
            }
        });
    }
});

views.ArticleDetailImpactTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    initialize: function() {
        this.styleLayout();
        this.listenTo(this.model, "change:destroy", this.destroyView);
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), helpers.templates);
        var tag_markup = templates.articleDetailTagFactory(tag_data);
        this.$el.html(tag_markup);
        return this;
    },
    styleLayout: function() {
        var bg_color = this.getColor(), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.getBorderColor();
        this.$el.css({
            "background-color": bg_color,
            color: text_color
        });
        var tooltip_text = this.getLabel();
        this.$el.addClass("tooltipped").attr("aria-label", tooltip_text);
        return this;
    },
    getColor: function() {
        return this.model.get("color");
    },
    getBorderColor: function() {
        return this.colorLuminance(this.getColor(), -.1);
    },
    getLabel: function() {
        var category = this.model.get("category"), level = helpers.templates.prettyName(this.model.get("level")), tooltip_text = level + " " + category;
        return tooltip_text;
    },
    destroyView: function(model, destroyMode) {
        if (destroyMode) {
            this.killView();
            this.model.set({
                destroy: false
            }, {
                silent: true
            });
        }
    }
});

views.ArticleDetailSubjectTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    events: {
        click: "removeFromArticle"
    },
    initialize: function() {
        this.styleLayout();
        this.listenTo(this.model, "change:destroy", this.destroyView);
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), {
            toTitleCase: helpers.templates.toTitleCase
        });
        var tag_markup = templates.articleDetailTagFactory(tag_data);
        this.$el.html(tag_markup);
        return this;
    },
    styleLayout: function() {
        var bg_color = this.model.get("color"), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.colorLuminance(bg_color, -.1);
        this.$el.css({
            "background-color": bg_color,
            color: text_color
        });
        return this;
    },
    destroyView: function(model, destroyMode) {
        if (destroyMode) {
            this.killView();
            this.model.set({
                destroy: false
            }, {
                silent: true
            });
        }
    },
    removeFromArticle: function() {}
});

views.ArticleDetailVizArticleReferrers = views.AA_BaseArticleViz.extend({
    initialize: function(options) {
        var referrer_metrics = options.referrer_metrics, title = options.title, which = options.which;
        this.section_title = title;
        this.setMarkup();
        this.$el.attr("data-which", which);
        var article_referrers_from_article = referrer_metrics.article_referrers;
        this.data = article_referrers_from_article;
        return this;
    },
    render: function() {
        var that = this;
        var vizContainer = this.$vizContainer.get(0);
        var d3_vizContainer = d3.select(vizContainer);
        var _links = d3_vizContainer.selectAll(".bar-container").data(this.data).enter();
        _links.append("div").classed("bar-text", true).html(function(d) {
            return '<a href="' + d + '" target="_blank">' + that.ppUrl(d) + "</a>";
        });
        return this;
    },
    ppUrl: function(url) {
        url = url.replace(/(http|https):\/\//, "");
        url = url.replace(/[^w{3}\.]([a-zA-Z0-9]([a-zA-Z0-9\-]{0,65}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/i, function(match) {
            return '<span class="highlight">' + match + "</span>";
        });
        return url;
    }
});

views.ArticleDetailVizDeviceFacet = views.AA_BaseArticleViz.extend({
    initialize: function(options) {
        var referrer_metrics = options.referrer_metrics, title = options.title, which = options.which;
        this.section_title = title;
        this.setMarkup();
        this.calcComparisonMarkerParams();
        this.$el.attr("data-which", which);
        this.listenTo(collections.article_comparisons.instance, "resetMetricHeaders", this.redrawMarker);
        var device_facets = [ {
            facet: "desktop",
            pageviews: 0
        }, {
            facet: "tablet",
            pageviews: 0
        }, {
            facet: "mobile",
            pageviews: 0
        } ];
        var device_facets_from_article = referrer_metrics.device_facets, total_pageviews = referrer_metrics.total.pageviews;
        device_facets.forEach(function(deviceFacet) {
            var existing_val = _.findWhere(device_facets_from_article, {
                facet: deviceFacet.facet
            }), pageviews;
            if (existing_val) {
                pageviews = existing_val.pageviews;
                deviceFacet.pageviews = pageviews;
            }
        });
        this.data = device_facets;
        this.total = total_pageviews;
        return this;
    }
});

views.ArticleDetailVizDomainFacets = views.AA_BaseArticleViz.extend({
    initialize: function(options) {
        var referrer_metrics = options.referrer_metrics, title = options.title, which = options.which;
        this.section_title = title;
        this.setMarkup();
        this.$el.attr("data-which", which);
        var domain_facets_from_article = referrer_metrics.ref_domain_facets, total_pageviews = referrer_metrics.total.pageviews;
        var twitter_facet = _.findWhere(referrer_metrics.ref_domain_facets, {
            facet: "t"
        });
        if (twitter_facet) {
            twitter_facet.facet = "twitter";
        }
        this.data = domain_facets_from_article.sort(function(a, b) {
            if (a.pageviews < b.pageviews) {
                return 1;
            } else {
                return -1;
            }
        });
        this.total = total_pageviews;
        return this;
    }
});

views.ArticleDetailVizInternalExternal = views.AA_BaseArticleViz.extend({
    initialize: function(options) {
        var referrer_metrics = options.referrer_metrics, title = options.title, which = options.which;
        this.section_title = title;
        this.setMarkup();
        this.calcComparisonMarkerParams();
        this.$el.attr("data-which", which);
        this.listenTo(collections.article_comparisons.instance, "resetMetricHeaders", this.redrawMarker);
        var entrances = referrer_metrics.total.entrances, pageviews = referrer_metrics.total.pageviews;
        this.data = [ {
            facet: "internal",
            pageviews: pageviews - entrances
        }, {
            facet: "external",
            pageviews: entrances
        } ];
        this.total = pageviews;
        return this;
    }
});

views.ArticleDetailVizTweets = views.AA_BaseArticleViz.extend({
    initialize: function(options) {
        var tweets = options.tweet_info, title = options.title, which = options.which;
        this.section_title = title;
        this.setMarkup();
        this.$el.attr("data-which", which);
        this.data = tweets;
        return this;
    },
    render: function() {
        var that = this;
        var vizContainer = this.$vizContainer.get(0);
        var d3_vizContainer = d3.select(vizContainer);
        var _tweets = d3_vizContainer.selectAll(".bar-container").data(this.data).enter();
        _tweets.append("div").classed("tweet-container", true).html(function(d) {
            var html_without_script = d.html.replace('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>', "");
            return html_without_script;
        });
        setTimeout(function() {
            window.twttr.widgets.load();
        }, 0);
        return this;
    },
    ppUrl: function(url) {
        url = url.replace(/(http|https):\/\//, "");
        url = url.replace(/[^w{3}\.]([a-zA-Z0-9]([a-zA-Z0-9\-]{0,65}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/i, function(match) {
            return '<span class="highlight">' + match + "</span>";
        });
        return url;
    }
});

views.ArticleDrawerSorter = Backbone.View.extend({
    events: {
        change: "setSortOnPoView"
    },
    initialize: function() {
        this.$sorter = this.$el.find("select");
    },
    render: function() {},
    setSortOnPoView: function(e) {
        var sort_value = this.$sorter.val();
        views.po.article_summaries.setSort(sort_value);
    }
});

views.ArticleSummaryDrawer = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    events: {
        "click .drawer-list-outer": "updateSelected"
    },
    initialize: function() {
        this._subviews = [];
        this.updateActiveSelectionField();
        this.listenTo(models.section_mode, "change:mode", this.updateActiveSelectionField);
        this.listenTo(this.model, "change:selected_for_detail", this.updateSelectedFromNonDrawer);
        this.listenTo(this.model, "change:active_selected", this.setActiveCssState);
        this.listenTo(this.model, "change:in_drawer", this.destroy);
    },
    render: function() {
        var drawer_list_item_markup = templates.articleSummaryDrawerFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        this.$subjectTagsContainer = this.$el.find(".subject-tags-container");
        this.$impactTagsContainer = this.$el.find(".impact-tags-container");
        this.setActiveCssState();
        this.addTags();
        return this;
    },
    updateSelected: function() {
        var is_active = this.model.get("active_selected"), mode = this.selected_for, selected_for = "selected_for_" + mode;
        if (mode == "compare") {
            is_active = !is_active;
            this.model.set(selected_for, is_active);
            this.model.set("active_selected", is_active);
        } else if (mode == "detail" && !is_active) {
            app.instance.staged_article_detail = this.model.get("id");
            app.instance.sectionMode.detail.call(app.instance);
        }
        return this;
    },
    clearRadios: function(id) {
        _.where(collections.po.article_summaries.items, {
            selected_for_detail: true
        }).forEach(function(po_articleSummary) {
            var deselect_candidate_id = po_articleSummary.id, bb_articleSummary;
            if (id != deselect_candidate_id) {
                bb_articleSummary = collections.article_summaries.instance.findWhere({
                    id: deselect_candidate_id
                });
                if (bb_articleSummary) {
                    bb_articleSummary.set("selected_for_detail", false, {
                        silent: true
                    });
                    bb_articleSummary.set("active_selected", false);
                } else {
                    po_articleSummary.selected_for_detail = false;
                    po_articleSummary.active_selected = false;
                }
            }
        });
    },
    updateSelectedFromNonDrawer: function(model, selectedForDetail) {
        var id = model.get("id"), active_selected = model.get("active_selected");
        if (selectedForDetail) {
            this.clearRadios(id);
            if (!active_selected) {
                this.model.set("active_selected", true);
            }
        }
    },
    updateActiveSelectionField: function(model, mode) {
        mode = mode || models.section_mode.get("mode");
        this.selected_for = mode;
    },
    setActiveCssState: function() {
        this.updateActiveSelectionField();
        var active_selected = this.model.get("active_selected") || false, selected_for_compare = this.model.get("selected_for_compare") || false, selected_for_detail = this.model.get("selected_for_detail") || false, id = this.model.get("id"), current_mode_selection_state = this.model.get("selected_for_" + this.selected_for) || false;
        this.$el.find(".drawer-list-outer").toggleClass("active", current_mode_selection_state);
        this.$el.find(".inputs-container input").prop("checked", current_mode_selection_state);
        var po_model = _.findWhere(collections.po.article_summaries.items, {
            id: id
        });
        po_model.selected_for_detail = selected_for_detail;
        return this;
    },
    addTags: function() {
        var subject_tags_full = this.model.get("subject_tags_full"), impact_tags_full = this.model.get("impact_tags_full");
        if (subject_tags_full.length) {
            this.$subjectTagsContainer.html('<span class="tag-list-title">Subj:</span>');
            subject_tags_full.forEach(function(subjectTag) {
                var tag_model = new models.subject_tag.Model(subjectTag);
                var tag_view = new views.ArticleSummaryDrawerSubjectTag({
                    model: tag_model
                }), tag_markup = tag_view.render().el;
                this._subviews.push(tag_view);
                this.$subjectTagsContainer.append(tag_markup);
            }, this);
        }
        if (impact_tags_full.length) {
            this.$impactTagsContainer.html('<span class="tag-list-title">Imp:</span>');
            impact_tags_full.forEach(function(impactTag) {
                var tag_model = new models.subject_tag.Model(impactTag);
                var tag_view = new views.ArticleSummaryDrawerImpactTag({
                    model: tag_model
                }), tag_markup = tag_view.render().el;
                this._subviews.push(tag_view);
                this.$impactTagsContainer.append(tag_markup);
            }, this);
        }
    },
    destroy: function(model, inDrawer) {
        if (!inDrawer) {
            this.killView();
        }
    }
});

views.ArticleSummaryDrawerImpactTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    initialize: function() {
        this.styleLayout();
        this.listenTo(this.model, "change:destroy", this.destroyView);
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), helpers.templates);
        var tag_markup = templates.articleDetailTagFactory(tag_data);
        this.$el.html(tag_markup);
        return this;
    },
    styleLayout: function() {
        var bg_color = this.getColor(), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.getBorderColor();
        this.$el.css({
            "background-color": bg_color,
            color: text_color
        });
        var tooltip_text = this.getLabel();
        this.$el.addClass("tooltipped").attr("aria-label", tooltip_text);
        return this;
    },
    getColor: function() {
        return this.model.get("color");
    },
    getBorderColor: function() {
        return this.colorLuminance(this.getColor(), -.1);
    },
    getLabel: function() {
        var category = this.model.get("category"), level = helpers.templates.prettyName(this.model.get("level")), tooltip_text = level + " " + category;
        return tooltip_text;
    },
    destroyView: function(model, destroyMode) {
        if (destroyMode) {
            this.killView();
            this.model.set({
                destroy: false
            }, {
                silent: true
            });
        }
    }
});

views.ArticleSummaryDrawerSubjectTag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag",
    initialize: function() {
        this.styleLayout();
        return this;
    },
    render: function() {
        var tag_data = _.extend(this.model.toJSON(), helpers.templates);
        var tag_markup = templates.articleDetailTagFactory(tag_data);
        this.$el.html(tag_markup);
        return this;
    },
    styleLayout: function() {
        var bg_color = this.model.get("color"), text_color = this.whiteOrBlack(bg_color), bg_color_darker = this.colorLuminance(bg_color, -.1);
        this.$el.css({
            "background-color": bg_color,
            color: text_color
        });
        return this;
    }
});

views.ArticleSummaryRow = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-row-wrapper",
    events: {
        "click .destroy": "removeRow"
    },
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy);
        this.listenTo(this.model, "redrawMarker", this.redrawMarker);
        this.units = {
            twitter: "Shares",
            facebook: "Likes",
            pageviews: "On page",
            avg_time_on_page: "Seconds",
            per_external: "Referrals"
        };
    },
    render: function() {
        var $el = this.$el, model_json = this.model.toJSON(), article_detail_markup = templates.articleSummaryRowFactory(_.extend(model_json, helpers.templates)), subject_tag_len, impact_tag_len;
        this.calcComparisonMarkerParams();
        this.$el.html(article_detail_markup);
        this.$el.attr("data-title", model_json.title).attr("data-timestamp", model_json.timestamp);
        this.data = this.transformData(this.model.toJSON());
        _.each(this.data.quant_metrics, function(bullet) {
            $el.attr("data-" + bullet.metric, bullet.value);
        });
        if (this.data.subject_tags) {
            subject_tag_len = this.data.subject_tags.length;
        } else {
            subject_tag_len = 0;
        }
        $el.attr("data-subject-tags", subject_tag_len);
        if (this.data.impact_tags) {
            impact_tag_len = this.data.impact_tags.length;
        } else {
            impact_tag_len = 0;
        }
        $el.attr("data-impact-tags", impact_tag_len);
        this._el = d3.select(this.el).select(".article-detail-row-container").selectAll(".cell");
        this.enter();
        return this;
    },
    calcComparisonMarkerParams: function() {
        this.comparison_marker_dimension = collections.article_comparisons.instance.metadata("comparison-marker-dimension");
        this.comparison_marker_group = collections.article_comparisons.instance.metadata("comparison-marker-group");
        this.comparison_marker_max = collections.article_comparisons.instance.metadata("comparison-marker-max");
        return this;
    },
    redrawMarker: function() {
        this.calcComparisonMarkerParams();
        var that = this;
        var markers = this.bullet_markers.transition().duration(450).ease("exp-out").styleTween("left", function(d) {
            var starting_px = parseFloat(d3.select(this).style("left")), parent_px = this.parentNode.offsetWidth, starting_percent = starting_px / parent_px * 100, ending_percent = that.helpers.calcSize.call(that, d.metric, that.comparison_marker_dimension, that.comparison_marker_max), ending_pixel = parseFloat(ending_percent) * parent_px;
            return d3.interpolate(starting_percent, ending_percent);
        });
    },
    transformData: function(modelData) {
        var subject_tag_columns = [], chunk = 3;
        if (modelData.subject_tags_full) {
            for (var i = 0; i < modelData.subject_tags_full.length; i += chunk) {
                subject_tag_columns.push(modelData.subject_tags_full.slice(i, i + chunk));
            }
            modelData.subject_tags_grouped = subject_tag_columns;
        }
        if (modelData.impact_tags_full) {
            modelData.impact_tags_grouped = d3.nest().key(function(d) {
                return d.category;
            }).entries(modelData.impact_tags_full);
        }
        var column_order = [ "twitter", "facebook", "pageviews", "avg_time_on_page", "per_external" ];
        modelData.quant_metrics = modelData.quant_metrics.filter(function(qMetric) {
            return column_order.indexOf(qMetric.metric) != -1;
        });
        modelData.quant_metrics.sort(function(a, b) {
            return column_order.indexOf(a.metric) - column_order.indexOf(b.metric);
        });
        return modelData;
    },
    enter: function(cb) {
        var that = this;
        var row = this._el.data([ this.data ]).enter();
        row.append("div").classed("cell", true).classed("title", true).classed("go-to-detail", true).classed("wide", true).classed("tooltipped", true).attr("data-tooltip-align", "left").attr("data-id", function(d) {
            return d.id;
        }).attr("aria-label", function(d) {
            var unicode_title = helpers.templates.htmlDecode(d.title);
            return unicode_title;
        }).append("div").classed("title-text", true).html(function(d) {
            return d.title;
        });
        row.append("div").classed("cell", true).classed("date", true).classed("single", true).attr("data-timestamp", function(d) {
            return d.timestamp;
        }).html(function(d) {
            return helpers.templates.conciseDate(d.timestamp);
        });
        var bullet_container = this._el.data(this.data.quant_metrics);
        var _bullet_container = bullet_container.enter().append("div").classed("cell", true).classed("multi", true).classed("gfx", true).classed("tooltipped", true).attr("aria-label", function(d) {
            var metric = d.metric, unit = that.units[d.metric], value = d.value;
            if (metric == "avg_time_on_page" && value > 0) {
                value = value.toFixed(2);
            }
            if (metric == "per_external" && value > 0) {
                value = Math.round(value * 100) + "%";
            }
            return unit + ": " + helpers.templates.addCommas(value);
        }).append("div").classed("bullet-container", true);
        var that = this;
        _bullet_container.append("div").classed("bullet", true).style("width", function(d) {
            var comparison_max = that.comparison_marker_max;
            if (d.metric == "per_external") {
                comparison_max = "max";
            }
            return that.helpers.calcSize.call(that, d.metric, d.value, comparison_max);
        });
        var bullet_markers = _bullet_container.append("div").classed("marker", true).style("left", function(d) {
            var comparison_max = that.comparison_marker_max;
            if (d.metric == "per_external") {
                comparison_max = "max";
            }
            return that.helpers.calcSize.call(that, d.metric, that.comparison_marker_dimension, comparison_max);
        });
        var subject_bar_container = row.append("div").classed("cell", true).classed("bars", true).classed("gfx", true).append("div").classed("bar-container", true).attr("data-group", "subject-tags");
        if (this.data.subject_tags_grouped) {
            subject_bar_container.selectAll(".bar-column").data(this.data.subject_tags_grouped).enter().append("div").classed("bar-column", true).selectAll(".bar").data(function(d) {
                return d;
            }).enter().append("div").classed("bar", true).style("background-color", function(d) {
                return d.color;
            }).classed("tooltipped", true).attr("aria-label", function(d) {
                return d.name;
            });
        }
        var impact_bar_container = row.append("div").classed("cell", true).classed("bars", true).classed("gfx", true).append("div").classed("bar-container", true).attr("data-group", "impact-tags");
        if (this.data.impact_tags_grouped) {
            var impact_bar_column = impact_bar_container.selectAll(".bar-column").data(this.data.impact_tags_grouped).enter().append("div").classed("bar-column", true);
            impact_bar_column.selectAll(".bar").data(function(d) {
                return d.values;
            }).enter().append("div").classed("bar", true).style("background-color", function(d) {
                return d.color;
            }).classed("tooltipped", true).attr("data-tooltip-align", "right").attr("aria-label", function(d) {
                return d.name + ": " + helpers.templates.toTitleCase(d.level) + " " + d.category;
            });
        }
        this.bullet_markers = bullet_markers;
        return this;
    },
    removeRow: function() {
        collections.article_comparisons.instance.remove(this.model);
        app.instance.saveHash();
        return this;
    },
    destroy: function(model, destroyMode) {
        if (destroyMode == "delete") {
            if (app.instance.$isotopeCntnr) {
                app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout");
            } else {}
            this.killView();
            model.set({
                destroy: false
            }, {
                silent: true
            });
        }
        return this;
    },
    helpers: {
        calcSize: function(metric, val, field, group) {
            field = field || this.comparison_marker_max;
            group = group || this.comparison_marker_group;
            var this_metrics_info = _.findWhere(pageData.articleComparisons[group], {
                metric: metric
            }), max = this_metrics_info[field], scale = d3.scale.linear().domain([ 0, max ]).range([ 0, 100 ]);
            if (typeof val == "string") {
                val = this_metrics_info[val];
            }
            return Math.round(scale(val)).toString() + "%";
        }
    }
});

views.ArticleTitleSearcher = Backbone.View.extend({
    events: {
        keyup: "listenForKeyup"
    },
    initialize: function() {},
    render: function() {},
    listenForKeyup: function() {
        var val = this.$el.val(), all_cids;
        if (val) {
            this.runBloodhound(val, this.addResultingCidsToFilter);
        } else {
            all_cids = views.po.article_summaries.all_cids;
            this.addResultingCidsToFilter(all_cids);
        }
    },
    runBloodhound: function(val, cb) {
        app.bloodhound.get(val, function(suggestions) {
            var cids = _.pluck(suggestions, "cid");
            cb(cids);
        });
    },
    addResultingCidsToFilter: function(cids) {
        collections.po.article_summaries.filters.title.query(cids);
    }
});

views.DateRangeSearcher = Backbone.View.extend({
    events: {
        "click .clear-date-range": "clearDateRange"
    },
    pikaday_options: {
        clearInvalidInput: true,
        onClear: function() {
            collections.po.article_summaries.filters.timestamp.clearQuery();
            this.setMinDate();
            this.setMaxDate();
        }
    },
    initialize: function() {
        this.$clearDateRange = this.$el.find(".clear-date-range");
        var that = this, start_opts = {
            field: this.$el.find('input[data-dir="from"]')[0],
            onSelect: function() {
                var thisDate = this.getDate();
                that.picker_end.setMinDate(thisDate);
                if (!that.picker_end.getDate()) {
                    that.picker_end.gotoDate(thisDate);
                }
                that.filterByDate.call(that);
            }
        }, end_opts = {
            field: this.$el.find('input[data-dir="to"]')[0],
            onSelect: function() {
                var thisDate = this.getDate();
                that.picker_start.setMaxDate(thisDate);
                that.filterByDate.call(that);
            }
        };
        _.extend(start_opts, this.pikaday_options);
        _.extend(end_opts, this.pikaday_options);
        this.picker_start = new Pikaday(start_opts);
        this.picker_end = new Pikaday(end_opts);
    },
    clearDateRange: function(e) {
        this.picker_start.clearDate(true);
        this.picker_end.clearDate(true);
        $(e.currentTarget).hide();
    },
    validateDates: function() {
        return this.picker_start.getDate() && this.picker_end.getDate();
    },
    filterByDate: function() {
        var valid_date_range = this.validateDates(), start_timestamp, end_timestamp;
        if (valid_date_range) {
            collections.po.article_summaries.filters.timestamp.clearQuery();
            start_timestamp = this.picker_start.getDate().getTime() / 1e3;
            end_timestamp = this.picker_end.getDate().getTime() / 1e3;
            collections.po.article_summaries.filters.timestamp.intersectQuery([ start_timestamp, end_timestamp ]);
            this.$clearDateRange.css("display", "inline-block");
        }
    }
});

views.DivisionSwitcher = Backbone.View.extend({
    events: {
        "click li": "setMode"
    },
    initialize: function() {
        this.listenTo(this.model, "change:mode", this.updateActiveState);
        this.updateActiveState();
    },
    setMode: function(e) {
        var $el = $(e.currentTarget);
        if (!$el.hasClass("active")) {
            var mode = $el.attr("data-mode");
            this.model.set("mode", mode);
        }
        return this;
    },
    updateActiveState: function(model, mode) {
        $("#drawer").attr("data-mode", mode);
        $("#content").attr("data-mode", mode);
        this.$el.find("li").removeClass("active");
        this.$el.find('li[data-mode="' + mode + '"]').addClass("active");
        return this;
    }
});

views.EventCreator = views.AA_BaseForm.extend({
    events: _.extend({
        "submit form": "createEvent"
    }, views.AA_BaseForm.prototype.events),
    initialize: function(options) {
        var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);
        console.log(options);
        var recipe_default_event = {
            assignees: options.defaults.assignees
        };
        event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, recipe_default_event);
        this.event_schema = event_creator_schema;
        this.bakeModal("Create an event");
        this.render();
        this.postRender();
    },
    render: function() {
        var markup = "", event_schema = $.extend(true, {}, this.event_schema);
        _.each(event_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
        }, this);
        markup += this.bakeButtons();
        this.$form.html(markup);
        this.event_data = {
            impact_tags: [],
            assignees: []
        };
        return this;
    },
    formListToObject: function() {
        var form_data = this.event_creator_options;
        var form_obj = {
            impact_tags: [],
            assignees: []
        };
        form_data.forEach(function(formItem) {
            var name = formItem.name, form_value = formItem.selected;
            if (name != "impact_tags" && name != "assignees") {
                form_obj[name] = form_value;
            } else {
                form_obj[name].push(form_value);
            }
        });
        return form_obj;
    },
    createEvent: function(e) {
        e.preventDefault();
        var settings_obj = this.event_data;
        var new_event_model = new models.event.Model();
        delete settings_obj.undefined;
        delete settings_obj["assignees-selector"];
        var required_keys = [ "timestamp", "assignees", "title", "impact_tags" ];
        this.validate(required_keys, function(error, description) {
            var that = this;
            if (!error) {
                console.log("no error");
                new_event_model.save(settings_obj, {
                    error: function(model, response, options) {
                        console.log("error in event creation", response);
                        that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
                    },
                    success: function(model, response, options) {
                        console.log("saved event", response);
                        views.helpers.toggleModal(e);
                        that.refresh();
                    }
                });
            } else {
                this.printMsgOnSubmit(error, description);
            }
        });
    }
});

views.EventCreatorFromAlert = views.AA_BaseForm.extend({
    events: _.extend({}, views.AA_BaseForm.prototype.events),
    initialize: function(options) {
        var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);
        var recipe_default_event = options.model.default_event;
        recipe_default_event.link = options.model.link;
        recipe_default_event.timestamp = options.model.timestamp;
        if (recipe_default_event.assignees) {
            recipe_default_event.assignees = recipe_default_event.assignees.map(function(id) {
                if (_.isNumber(id)) {
                    return _.findWhere(pageData.articleSkeletons, {
                        id: id
                    });
                } else {
                    return id;
                }
            });
        }
        event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, recipe_default_event);
        this.event_schema = event_creator_schema;
        this.bakeModal("Create an event");
        this.render();
        this.postRender();
    },
    render: function() {
        var markup = "", event_schema = $.extend(true, {}, this.event_schema);
        _.each(event_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
        }, this);
        markup += this.bakeButtons();
        this.$form.html(markup);
        this.event_data = {
            impact_tags: [],
            assignees: []
        };
        return this;
    },
    formListToObject: function() {
        var form_data = this.event_creator_options;
        var form_obj = {
            impact_tags: [],
            assignees: []
        };
        form_data.forEach(function(formItem) {
            var name = formItem.name, form_value = formItem.selected;
            if (name != "impact_tags" && name != "assignees") {
                form_obj[name] = form_value;
            } else {
                form_obj[name].push(form_value);
            }
        });
        return form_obj;
    },
    getSettings: function() {
        var settings_obj = this.event_data;
        delete settings_obj.undefined;
        delete settings_obj["assignees-selector"];
        console.log(settings_obj);
        return settings_obj;
        return this;
    }
});

views.EventEditor = views.AA_BaseForm.extend({
    events: _.extend({
        "change input": "printData",
        "submit form": "createEvent"
    }, views.AA_BaseForm.prototype.events),
    initialize: function(options) {
        this.model = options.model;
        var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);
        delete event_creator_schema.assignees;
        event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, options.defaults);
        this.event_schema = event_creator_schema;
        this.bakeModal("Edit this event");
        this.render();
        this.postRender(true);
    },
    render: function() {
        var markup = "", event_schema = $.extend(true, {}, this.event_schema);
        _.each(event_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
        }, this);
        markup += this.bakeButtons(true);
        this.$form.html(markup);
        var defaults = {
            timestamp: event_schema.timestamp.selected,
            link: event_schema.link.selected,
            title: event_schema.title.selected,
            what_happened: event_schema.what_happened.selected,
            significance: event_schema.significance.selected,
            impact_tags: event_schema.impact_tags.selected
        };
        this.event_data = _.extend({
            impact_tags: [],
            assignees: []
        }, defaults);
        return this;
    },
    formListToObject: function() {
        var form_data = this.event_creator_options;
        var form_obj = {
            impact_tags: [],
            assignees: []
        };
        form_data.forEach(function(formItem) {
            var name = formItem.name, form_value = formItem.selected;
            if (name != "impact_tags" && name != "assignees") {
                form_obj[name] = form_value;
            } else {
                form_obj[name].push(form_value);
            }
        });
        return form_obj;
    },
    createEvent: function(e) {
        e.preventDefault();
        var settings_obj = this.event_data;
        delete settings_obj.assignees;
        var required_keys = [ "timestamp", "title", "impact_tags" ];
        this.validate(required_keys, function(error, description) {
            var that = this;
            if (!error) {
                that.model.save(settings_obj, {
                    patch: true,
                    error: function(model, response, options) {
                        console.log("error in event edit", response);
                        that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
                    },
                    success: function(model, response, options) {
                        console.log("event edited", response);
                        that.printMsgOnSubmit(false, "");
                        views.helpers.toggleModal(e);
                        that.model.trigger("rerender");
                    }
                });
            } else {
                this.printMsgOnSubmit(error, description);
            }
        });
    }
});

views.RecipeCreator = views.AA_BaseForm.extend({
    events: _.extend({}, views.AA_BaseForm.prototype.events),
    initialize: function(opts) {
        this.recipe_schema = opts.recipeSchema.schema;
        this.event_schema = opts.recipeSchema.default_event;
        this.$form = this.$el.find("form");
        this.$defaultEvents = this.$el.find(".default-event-container");
        this.render();
        this.renderDefaultEvent();
        this.postRender();
        return this;
    },
    render: function() {
        var markup = "", recipe_schema = this.recipe_schema, default_event_markup;
        _.each(recipe_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
        }, this);
        this.$form.prepend(markup);
        default_event_markup = this.renderDefaultEvent();
        this.$defaultEvents.html(default_event_markup);
        this.event_data = {
            impact_tags: [],
            assignees: []
        };
        return this;
    },
    renderDefaultEvent: function() {
        var markup = "", default_event_schema = this.event_schema;
        _.each(default_event_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData, "default_event");
        }, this);
        return markup;
    },
    formListToObject: function() {
        var form_data = this.event_creator_options;
        var form_obj = {
            impact_tags: [],
            assignees: []
        };
        form_data.forEach(function(formItem) {
            var name = formItem.name, form_value = formItem.selected;
            if (name != "impact_tags" && name != "assignees") {
                form_obj[name] = form_value;
            } else {
                form_obj[name].push(form_value);
            }
        });
        return form_obj;
    },
    getSettings: function() {
        this.$el.find(".form-row-input-container select").each(function(i, el) {
            $(el).trigger("change");
        });
        delete this.event_data["assignees-selector"];
        return this.event_data;
    }
});

views.RecipeDrawer = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    events: {
        "click .drawer-list-outer:not(active)": "filter",
        "click .settings-switch": "toggleModal",
        "click .toggle-default-event": "toggleDefaults",
        "submit form": "saveModal",
        "click .destroy": "destroyModel"
    },
    initialize: function() {
        this._subviews = [];
        this.listenTo(this.model, "filter", this.filter);
        this.listenTo(this.model, "change:viewing", this.setActiveCssState);
        this.listenTo(this.model, "change:enabled", this.renderEnabled);
        this.listenTo(this.model, "change:set_default_event", this.showHideDefaults);
        return this;
    },
    render: function() {
        if (this._time_picker) {
            this._time_picker.destroy();
        }
        var drawer_list_item_markup = templates.recipeFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        this.$form = this.$el.find("form");
        this.$defaultEvents = this.$el.find(".default-event-container");
        this.$defautEventsBtn = this.$el.find(".toggle-default-event");
        this.$submitMsg = this.$el.find(".submit-msg");
        this.postRender();
        return this;
    },
    postRender: function() {
        this.bakeRecipeEditor();
    },
    bakeRecipeEditor: function() {
        var recipe_editor_view = new views.RecipeEditor({
            el: this.el,
            model: this.model.toJSON()
        });
        this._subviews.push(recipe_editor_view);
        this._time_picker = recipe_editor_view.time_picker;
        this.$el.append(recipe_editor_view.el);
        this.recipe_editor_view = recipe_editor_view;
        return this;
    },
    filter: function() {
        var recipe_id = this.model.id;
        collections.po.alerts.filters.recipe_id.query(recipe_id);
        app.instance.show_all_view.deactivate();
        this.model.set("viewing", true);
        routing.router.navigate("my-recipes/" + recipe_id);
        return this;
    },
    renderEnabled: function(model, enabled) {
        this.$el.find(".enable-switch").attr("data-enabled", enabled).html(helpers.templates.formatEnabled(enabled));
        return this;
    },
    toggleModal: function(e) {
        this.killEvent(e);
        views.helpers.toggleModal(e);
        return this;
    },
    saveModal: function(e) {
        e.preventDefault();
        var that = this;
        var set_default_event = this.model.get("set_default_event");
        var recipe_data = $.extend(true, {}, this.recipe_editor_view.getSettings(set_default_event));
        var model_data = this.model.toJSON();
        if (set_default_event) {
            model_data.default_event = {
                assignees: recipe_data.assignees,
                title: recipe_data.title,
                what_happened: recipe_data.what_happened,
                significance: recipe_data.significance,
                impact_tags: recipe_data.impact_tags
            };
        } else {
            model_data.default_event = {};
        }
        delete recipe_data.assignees;
        delete recipe_data.title;
        delete recipe_data.what_happened;
        delete recipe_data.significance;
        delete recipe_data.impact_tags;
        model_data.name = recipe_data.name;
        delete recipe_data.name;
        model_data.settings = recipe_data;
        delete model_data.viewing;
        delete model_data.pending;
        var required_keys = _.keys(recipe_data);
        required_keys.push("name");
        var this_right_here = this;
        this.recipe_editor_view.validate(required_keys, function(error, description) {
            var that = this;
            if (!error) {
                this_right_here.model.save(model_data, {
                    error: function(model, response, options) {
                        console.log("error in recipe update", response);
                        that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
                    },
                    success: function(model, response, options) {
                        console.log("updated recipe", response);
                        that.printMsgOnSubmit(false, "");
                        that.toggleModal(e);
                        this_right_here.render();
                    }
                });
            } else {
                this.printMsgOnSubmit(error, description);
            }
        });
        return this;
    },
    destroyModel: function(e) {
        var that = this;
        this.model.destroy({
            success: function(model, response, options) {
                console.log("recipe destroyed", response);
                that.toggleModal(e);
                that.$el.remove();
            },
            error: function(model, response, options) {
                console.log("error in model destroy", response);
                alert("Your destroy did not work. Please try again. Check the console for errors.");
            }
        });
        return this;
    },
    toggleEnabled: function(e) {
        this.killEvent(e);
        this.model.set("enabled", !this.model.get("enabled"));
    },
    killEvent: function(e) {
        e.stopPropagation();
    },
    setActiveCssState: function(model, viewing) {
        this.$el.find(".drawer-list-outer").toggleClass("active", viewing);
        this.$el.find(".inputs-container input").prop("checked", viewing);
        return this;
    },
    toggleDefaults: function() {
        this.model.set("set_default_event", !this.model.get("set_default_event"));
    },
    showHideDefaults: function(model, open) {
        var slide_duration = 350;
        if (open) {
            this.$defautEventsBtn.html("Enabled").attr("data-status", "true");
            this.$defaultEvents.slideDown(slide_duration, "easeOutQuint");
        } else {
            this.$defautEventsBtn.html("Disabled").attr("data-status", "false");
            this.$defaultEvents.slideUp(slide_duration, "easeOutQuint");
        }
    }
});

views.RecipeEditor = views.AA_BaseForm.extend({
    events: _.extend({
        "click .modal-outer": "stopPropagation"
    }, views.AA_BaseForm.prototype.events),
    initialize: function(opts) {
        var source = opts.model.source, recipe_settings = opts.model.settings, default_event_settings = opts.model.default_event;
        var recipe_schema_model = $.extend(true, {}, _.findWhere(pageData.recipeSchemas, {
            source: source
        })), recipe_schema = recipe_schema_model.schema, recipe_default_event = recipe_schema_model.default_event;
        recipe_schema = this.combineFormSchemaWithVals(recipe_schema, recipe_settings);
        recipe_schema.name.selected = opts.model.name;
        recipe_default_event = this.combineFormSchemaWithVals(recipe_default_event, default_event_settings);
        if (recipe_default_event.assignees.selected) {
            recipe_default_event.assignees.selected = recipe_default_event.assignees.selected.map(function(id) {
                return _.findWhere(pageData.articleSkeletons, {
                    id: id
                });
            });
        }
        if (recipe_default_event.impact_tags.selected) {
            recipe_default_event.impact_tags.selected = recipe_default_event.impact_tags.selected.map(function(id) {
                return _.findWhere(recipe_default_event.impact_tags.options, {
                    id: id
                });
            });
        }
        this.recipe_schema = recipe_schema;
        this.event_schema = recipe_default_event;
        this.$form = this.$el.find("form");
        this.$defaultEvents = this.$el.find(".default-event-container");
        this.render();
        this.postRender();
        return this;
    },
    render: function() {
        var markup = "", recipe_schema = this.recipe_schema, default_event_markup;
        _.each(recipe_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
        }, this);
        this.$form.prepend(markup);
        default_event_markup = this.renderDefaultEvent();
        this.$defaultEvents.html(default_event_markup);
        this.event_data = {
            impact_tags: [],
            assignees: []
        };
        return this;
    },
    renderDefaultEvent: function() {
        var markup = "", default_event_schema = this.event_schema;
        _.each(default_event_schema, function(fieldData, fieldName) {
            markup += this.bakeFormInputRow.call(this, fieldName, fieldData, "default_event");
        }, this);
        return markup;
    },
    formListToObject: function() {
        var form_data = this.event_creator_options;
        var form_obj = {
            impact_tags: [],
            assignees: []
        };
        form_data.forEach(function(formItem) {
            var name = formItem.name, form_value = formItem.selected;
            if (name != "impact_tags" && name != "assignees") {
                form_obj[name] = form_value;
            } else {
                form_obj[name].push(form_value);
            }
        });
        return form_obj;
    },
    getSettings: function() {
        this.$el.find(".form-row-input-container select,.form-row-input-container input").each(function(i, el) {
            $(el).trigger("change");
        });
        delete this.event_data["assignees-selector"];
        delete this.event_data.undefined;
        return this.event_data;
    },
    stopPropagation: function(e) {
        e.stopPropagation();
        return this;
    }
});

views.RecipeSchemaForm = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper mode-content",
    events: {
        "click .toggle-default-event": "toggleDefaults",
        "submit form": "save"
    },
    initialize: function() {
        this._subviews = [];
        this.listenTo(this.model, "change:destroy", this.destroy);
        this.listenTo(this.model, "change:set_default_event", this.showHideDefaults);
        return this;
    },
    render: function() {
        var river_item_markup = templates.recipeSchemaFormFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(river_item_markup).attr("data-mode", "create-new");
        this.$form = this.$el.find("form");
        this.$defaultEvents = this.$el.find(".default-event-container");
        this.$defautEventsBtn = this.$el.find(".toggle-default-event");
        this.$submitMsg = this.$el.find(".submit-msg");
        if (this.model.get("set_default_event")) {
            this.$defaultEvents.show();
            this.showHideDefaults();
        }
        this.postRender();
        return this;
    },
    postRender: function() {
        this.bakeRecipeCreator();
        return this;
    },
    bakeRecipeCreator: function() {
        var event_creator_view = new views.RecipeCreator({
            el: this.el,
            recipeSchema: this.model.toJSON()
        });
        this._subviews.push(event_creator_view);
        this._time_picker = event_creator_view._time_picker;
        this.$el.append(event_creator_view.el);
        this.event_creator_view = event_creator_view;
        return this;
    },
    save: function(e) {
        e.preventDefault();
        var that = this;
        var set_default_event = $.extend(true, {}, this.model.get("set_default_event"));
        var recipe_data = $.extend(true, {}, this.event_creator_view.getSettings(set_default_event));
        var model_data = this.model.toJSON();
        delete model_data.schema;
        if (set_default_event) {
            model_data.default_event = {
                assignees: recipe_data.assignees,
                title: recipe_data.title,
                what_happened: recipe_data.what_happened,
                significance: recipe_data.significance,
                impact_tags: recipe_data.impact_tags
            };
        } else {
            model_data.default_event = {};
        }
        delete recipe_data.assignees;
        delete recipe_data.title;
        delete recipe_data.what_happened;
        delete recipe_data.significance;
        delete recipe_data.impact_tags;
        model_data.name = recipe_data.name;
        delete recipe_data.name;
        model_data.settings = recipe_data;
        delete model_data.viewing;
        var new_recipe_creator_model = new models.recipe_creator.Model();
        var required_keys = _.keys(this.model.get("schema"));
        required_keys = _.without(required_keys, "requires_approval");
        var this_right_here = this;
        this.event_creator_view.validate(required_keys, function(error, description) {
            var that = this;
            if (!error) {
                new_recipe_creator_model.save(model_data, {
                    error: function(model, response, options) {
                        console.log("error in recipe creation", response);
                        this_right_here.flashSubmitMsg(false, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
                    },
                    success: function(model, response, options) {
                        console.log("saved recipe", response);
                        that._time_picker.destroy();
                        this_right_here.render();
                        this_right_here.flashSubmitMsg(false, "Recipe saved!");
                        var id = response.id;
                        model.set("pending", 0);
                        model.set("id", id);
                        collections.recipes.account_instance.add(model, {
                            at: 0
                        });
                    }
                });
            } else {
                this.printMsgOnSubmit(error, description);
            }
        });
    },
    flashSubmitMsg: function(error, msg) {
        var class_name = "success";
        if (error) class_name = "fail";
        this.$submitMsg.removeClass("success").removeClass("fail");
        this.$submitMsg.addClass(class_name).html(msg).delay(7e3).fadeOut(500).delay(750).queue(function(next) {
            $(this).html("").removeClass(class_name).show();
            next();
        });
    },
    toggleDefaults: function() {
        this.model.set("set_default_event", !this.model.get("set_default_event"));
    },
    showHideDefaults: function() {
        var open = this.model.get("set_default_event"), slide_duration = 350;
        if (open) {
            this.$defautEventsBtn.html("Enabled").attr("data-status", "true");
            this.$defaultEvents.slideDown(slide_duration, "easeOutQuint");
        } else {
            this.$defautEventsBtn.html("Disabled").attr("data-status", "false");
            this.$defaultEvents.slideUp(slide_duration, "easeOutQuint");
        }
    }
});

views.RecipeSchemaListItem = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    initialize: function() {
        return this;
    },
    render: function() {
        var drawer_list_item_markup = templates.recipeSchemaListItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        return this;
    }
});

views.ShowAllRecipes = Backbone.View.extend({
    tagName: "div",
    className: "drawer-container",
    events: {
        "click .drawer-list-outer:not(.active)": "setState"
    },
    initialize: function() {},
    render: function(hasRecipes) {
        var tag_markup = templates.drawerMyRecipesPrepFactory({
            hasRecipes: hasRecipes
        });
        this.$el.html(tag_markup);
        this.setState();
        return this;
    },
    setState: function() {
        this.styleLayout(true);
        this.filter();
    },
    styleLayout: function(mode) {
        collections.recipes.account_instance.where({
            viewing: true
        }).forEach(function(accountRecipe) {
            accountRecipe.set("viewing", false);
        });
        this.$el.find(".drawer-list-outer").toggleClass("active", mode);
        this.$el.find(".inputs-container input").prop("checked", mode);
    },
    filter: function() {
        collections.po.alerts.filters.recipe_id.clearQuery();
        routing.router.navigate("my-recipes");
    },
    deactivate: function() {
        this.styleLayout(false);
    }
});

views.Tag = views.AA_BaseTag.extend({
    tagName: "li",
    className: "tag-wrapper",
    events: {
        click: "toggle"
    },
    initialize: function() {
        this.listenTo(this.model, "change:active", this.styleLayout);
        this.listenTo(this.model, "change:active", this.filter);
    },
    render: function() {
        var tag_markup = templates.tagFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(tag_markup);
        this.styleLayout();
        return this;
    },
    filter: function(tagModel, isActive) {
        var po_collection = tagModel.collection.metadata("po_collection"), filter = tagModel.collection.metadata("filter"), query_value = tagModel.get("id") || tagModel.get("name");
        if (isActive) {
            collections.po[po_collection].filters[filter].intersectQuery(query_value);
        } else {
            collections.po[po_collection].filters[filter].removeSingleQuery(query_value);
        }
        return this;
    },
    styleLayout: function() {
        var is_active = this.model.get("active"), bg_color = this.model.get("color"), set_bg_color = "auto", set_text_color = "auto";
        this.$el.find(".tag-container").css("border-left-color", bg_color);
        if (is_active) {
            set_bg_color = bg_color;
            set_text_color = this.whiteOrBlack(set_bg_color);
        }
        this.$el.toggleClass("active", is_active);
        this.$el.find(".tag-container").css({
            "background-color": set_bg_color,
            color: set_text_color
        });
        return this;
    },
    toggle: function() {
        this.model.toggle("active");
        return this;
    }
});

views.helpers = {
    toggleModal: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $tray = $(e.currentTarget).parents(".modal-parent").find(".modal-outer");
        $tray.toggleClass("active", !$tray.hasClass("active"));
        $("body").attr("data-modal", $tray.hasClass("active"));
        this.centerishInViewport($tray.find(".modal-inner"));
    },
    centerishInViewport: function($el) {
        var el_width = $el.outerWidth(), el_height = $el.outerHeight(), v_width = $(window).width(), v_height = $(window).height();
        $el.css({
            top: (v_height / 2 - el_height / 2) / v_height * 100 - 10 + "%",
            left: (v_width / 2 - el_width / 2) / v_width * 100 + "%"
        });
    },
    formSerialToObject: function(formInputsArray) {
        var inputArrays = formInputsArray.map(function(inputObj) {
            var name_parts;
            if (inputObj.name.indexOf("impact_tags|") != -1 || inputObj.name.indexOf("assignees|") != -1) {
                name_parts = inputObj.name.split("|");
                inputObj.name = name_parts[0];
                inputObj.value = name_parts[1];
            }
            return inputObj;
        });
        var inputObj = d3.nest().key(function(d) {
            return d.name;
        }).rollup(function(list) {
            if (list.length == 1 && list[0].name != "impact_tags" && list[0].name != "assignees") {
                console.log(list[0].name);
                return list[0].value;
            } else {
                return list.map(function(f) {
                    return f.value;
                });
            }
        }).map(inputArrays);
        return inputObj;
    },
    remodelRecipeJson: {
        create: function(formInfo, formInputsArray) {
            var input_obj = views.helpers.formSerialToObject(formInputsArray);
            formInfo.name = input_obj.name;
            delete input_obj.name;
            formInfo.settings = input_obj;
            formInfo.default_event = {};
            if (formInfo.set_default_event) {
                formInfo.default_event = {
                    title: input_obj.title,
                    what_happened: input_obj.what_happened,
                    significance: input_obj.significance,
                    impact_tags: input_obj.impact_tags
                };
            }
            delete input_obj.title;
            delete input_obj.what_happened;
            delete input_obj.significance;
            delete input_obj.impact_tags;
            return formInfo;
        },
        update: function(formInfo, formInputsArray) {
            var input_obj = views.helpers.formSerialToObject(formInputsArray);
            formInfo.name = input_obj.name;
            delete input_obj.name;
            delete input_obj.pending;
            formInfo.settings = input_obj;
            formInfo.default_event = {};
            if (formInfo.set_default_event) {
                formInfo.default_event = {
                    title: input_obj.title,
                    what_happened: input_obj.what_happened,
                    significance: input_obj.significance,
                    impact_tags: input_obj.impact_tags
                };
            }
            delete input_obj.title;
            delete input_obj.what_happened;
            delete input_obj.significance;
            delete input_obj.impact_tags;
            return formInfo;
        }
    },
    remodelEventJson: function(alert_id, formInputsArray) {
        var input_obj = views.helpers.formSerialToObject(formInputsArray);
        input_obj.alert_id = alert_id;
        input_obj.timestamp = +input_obj.timestamp;
        if (input_obj.impact_tags && input_obj.impact_tags.length) {
            input_obj.impact_tags = input_obj.impact_tags.map(function(impactTag) {
                return pageData.org.impact_tags.filter(function(iT) {
                    return iT.name === impactTag;
                })[0].id;
            });
        } else {
            input_obj.impact_tags = [];
        }
        if (input_obj.assignees && input_obj.assignees.length) {
            input_obj.assignees = input_obj.assignees.map(function(assignee) {
                return +assignee;
            });
        } else {
            input_obj.assignees = [];
        }
        delete input_obj["assignees-selector"];
        return input_obj;
    }
};

views.po = {};

routing = {
    Router: Backbone.Router.extend({
        initialize: function(section) {
            this.history = [];
            this.listenTo(this, "route", function(name, args) {
                if (!_.isUndefined(args[1])) {
                    this.history.push({
                        name: name,
                        mode: args[0],
                        ids: args[1],
                        fragment: Backbone.history.fragment
                    });
                }
            });
            routing.init[section].call(this);
            routing.init.common.call(this);
        },
        loadRecipesAlerts: function(mode, recipe_id) {
            recipe_id = +recipe_id;
            this.setModeOnly(mode);
            collections.recipes.account_instance.findWhere({
                id: recipe_id
            }).trigger("filter");
        },
        setModeOnly: function(mode) {
            models.section_mode.set("mode", mode);
        },
        compareArticles: function(ids) {
            models.section_mode.compare.current_ids = ids;
            var is_compare_mode = models.section_mode.get("mode") == "compare", compare_models;
            if (!is_compare_mode) {
                models.section_mode.set("mode", "compare");
            } else {
                compare_models = ids.split("+").map(function(id) {
                    return _.findWhere(collections.po.article_summaries.items, {
                        id: +id
                    });
                });
                collections.article_comparisons.instance.set(compare_models, {
                    merge: true
                });
            }
        },
        detailArticle: function(id) {
            var is_detail_mode = models.section_mode.get("mode") == "detail";
            id = +id;
            if (!is_detail_mode) {
                app.instance.staged_article_detail = id;
                models.section_mode.set("mode", "detail");
            } else {
                app.instance.detail.getDetailModelFromId.call(app.instance, id, app.instance.detail.loadPage);
            }
        }
    }),
    helpers: {
        getMode: function(hash) {
            return hash.split("/")[0].replace(/#/g, "");
        },
        getArticleIds: function(hash) {
            return hash.split("/")[1];
        },
        exists: function(hash, articleId) {
            var id_regex = new RegExp(articleId);
            return id_regex.test(hash);
            return false;
        }
    }
};

templates.init = {
    articles: function() {
        this.tagFactory = _.template($("#tag-templ").html());
        this.articleSummaryDrawerFactory = _.template($("#article-summary-drawer-templ").html());
        this.drawerPointers = $("#drawer-pointers-templ").html();
        this.articleGridContainerMarkup = $("#article-grid-container-templ").html();
        this.articleSummaryRowFactory = _.template($("#article-summary-row-templ").html());
        this.articleDetailFactory = _.template($("#article-detail-templ").html());
        this.articleDetailTagFactory = _.template($("#article-detail-tag-templ").html());
        this.articleDetailAccountSubjectTagFactory = _.template($("#article-detail-account-subject-tag-templ").html());
    },
    "approval-river": function() {
        this.drawerMyRecipesPrepFactory = _.template($("#drawer-my-recipes-templ").html());
        this.drawerCreatePrep = $("#drawer-create-templ").html();
        this.alertFactory = _.template($("#alert-templ").html());
        this.recipeFactory = _.template($("#recipe-templ").html());
        this.recipeSchemaListItemFactory = _.template($("#recipe-schema-list-item-templ").html());
        this.recipeSchemaFormFactory = _.template($("#recipe-schema-form-templ").html());
    },
    settings: function() {
        this.settingsFactory = _.template($("#settings-templ").html());
        this.impactTagInputFactory = _.template($("#impact-tag-input-templ").html());
        this.singleInputFactory = _.template($("#single-input-templ").html());
        this.multiInputFactory = _.template($("#multi-input-templ").html());
        this.multiInputDoubleFactory = _.template($("#multi-input-double-templ").html());
    }
};

models.init = {
    articles: function() {
        this.section_mode = new models.section_mode.Model();
        this.section_mode.compare = {};
    },
    "approval-river": function() {
        this.section_mode = new models.section_mode.Model();
    },
    settings: function() {
        this.org.instance = new this.org.Model(pageData.org);
    }
};

collections.init = {
    articles: function() {
        this.subject_tags.instance = new this.subject_tags.Collection(pageData.subject_tags);
        this.impact_tags.instance = new this.impact_tags.Collection(pageData.impact_tags);
        this.impact_tag_attributes.categories_instance = new this.impact_tag_attributes.Collection(pageData.impact_tag_categories);
        this.impact_tag_attributes.levels_instance = new this.impact_tag_attributes.Collection(pageData.impact_tag_levels);
        this.impact_tag_attributes.categories_instance.metadata("filter", "impact_tag_categories");
        this.impact_tag_attributes.levels_instance.metadata("filter", "impact_tag_levels");
        this.subject_tags.instance.metadata("po_collection", "article_summaries");
        this.impact_tags.instance.metadata("po_collection", "article_summaries");
        this.impact_tag_attributes.categories_instance.metadata("po_collection", "article_summaries");
        this.impact_tag_attributes.levels_instance.metadata("po_collection", "article_summaries");
        this.po.article_summaries = new PourOver.Collection(pageData.articleSummaries);
        var subject_tag_ids = pageData.subject_tags.map(function(subject_tag) {
            return subject_tag.id;
        }), impact_tag_ids = pageData.impact_tags.map(function(impact_tag) {
            return impact_tag.id;
        }), impact_tag_category_names = pageData.impact_tag_categories.map(function(impact_tag_category) {
            return impact_tag_category.name;
        }), impact_tag_level_names = pageData.impact_tag_levels.map(function(impact_tag_level) {
            return impact_tag_level.name;
        });
        var subject_tags_filter = PourOver.makeInclusionFilter("subject_tags", subject_tag_ids), impact_tags_filter = PourOver.makeInclusionFilter("impact_tags", impact_tag_ids), impact_tag_category_filter = PourOver.makeInclusionFilter("impact_tag_categories", impact_tag_category_names), impact_tag_level_filter = PourOver.makeInclusionFilter("impact_tag_levels", impact_tag_level_names);
        var text_search_filter = PourOver.makeManualFilter("title");
        var timestamp_filter = PourOver.makeContinuousRangeFilter("timestamp", {
            attr: "timestamp"
        });
        this.po.filters = {
            impact_tags: impact_tags_filter,
            impact_tag_categories: impact_tag_category_filter,
            impact_tag_levels: impact_tag_level_filter,
            timestamps: timestamp_filter
        };
        this.po.article_summaries.addFilters([ subject_tags_filter, impact_tags_filter, impact_tag_category_filter, impact_tag_level_filter, text_search_filter, timestamp_filter ]);
        var timestampSortDesc = init.common.makePourOverSort("timestamp"), pageviewsSortDesc = init.common.makePourOverSort("pageviews"), twitterMentionsSortDesc = init.common.makePourOverSort("twitter"), facebookLikesSortDesc = init.common.makePourOverSort("facebook"), avgTimeOnPageSortDesc = init.common.makePourOverSort("avg_time_on_page"), perInternalSortDesc = init.common.makePourOverSort("per_internal"), perExternalSortDesc = init.common.makePourOverSort("per_external");
        var subjectTagsSortDesc = init.common.makePourOverSortByLength("subject_tags"), impactTagsSortDesc = init.common.makePourOverSortByLength("impact_tags");
        var timestamp_sort_desc = new timestampSortDesc("timestamp_desc"), pageviews_sort_desc = new pageviewsSortDesc("pageviews_desc"), twitter_mentions_sort_desc = new twitterMentionsSortDesc("twitter_mentions_desc"), facebook_likes_sort_desc = new facebookLikesSortDesc("facebook_likes_desc"), avg_time_on_page_sort_desc = new avgTimeOnPageSortDesc("avg_time_on_page_desc"), per_internal_sort_desc = new perInternalSortDesc("per_internal_desc"), per_external_sort_desc = new perExternalSortDesc("per_external_desc"), subject_tags_sort_desc = new subjectTagsSortDesc("subject_tags_desc"), impact_tags_sort_desc = new impactTagsSortDesc("impact_tags_desc");
        this.po.sorts.timestamp_desc = new timestampSortDesc("timestamp_desc2");
        this.po.article_summaries.addSorts([ timestamp_sort_desc, pageviews_sort_desc, twitter_mentions_sort_desc, facebook_likes_sort_desc, avg_time_on_page_sort_desc, per_internal_sort_desc, per_external_sort_desc, subject_tags_sort_desc, impact_tags_sort_desc ]);
        this.article_summaries.instance = new this.article_summaries.Collection();
        this.article_comparisons.instance = new this.article_comparisons.Collection([]);
        collections.article_comparisons.instance.metadata("comparison-marker-dimension", "mean");
        collections.article_comparisons.instance.metadata("comparison-marker-group", "all");
        collections.article_comparisons.instance.metadata("comparison-marker-max", "per97_5");
        this.articles_detailed.instance = new this.articles_detailed.Collection();
        this.article_detailed.instance = new this.article_detailed.Collection();
        this.article_detailed.instance.metadata("selected-tab", "life");
        this.article_detailed_subject_tags.instance = new this.article_detailed_subject_tags.Collection();
        this.article_detailed_impact_tags.instance = new this.article_detailed_impact_tags.Collection();
        this.article_detailed_impact_tag_attributes.categories_instance = new this.article_detailed_impact_tag_attributes.Collection();
        this.article_detailed_impact_tag_attributes.categories_instance.metadata("which", "categories");
        this.article_detailed_impact_tag_attributes.levels_instance = new this.article_detailed_impact_tag_attributes.Collection();
        this.article_detailed_impact_tag_attributes.levels_instance.metadata("which", "levels");
    },
    "approval-river": function() {
        this.recipes.account_instance = new this.recipes.Collection(pageData.accountRecipes);
        this.recipes.schemas_instance = new this.recipes.Collection(pageData.recipeSchemas);
        this.active_alerts.instance = new this.active_alerts.Collection([]);
        this.po.alerts = new PourOver.Collection(pageData.alerts.results);
        var timestampSortDesc = init.common.makePourOverSort("timestamp");
        var timestamp_sort_desc = new timestampSortDesc("timestamp_desc");
        this.po.alerts.addSorts([ timestamp_sort_desc ]);
        var recipe_ids = pageData.accountRecipes.map(function(accountRecipe) {
            return accountRecipe.id;
        });
        var recipe_id_filter = PourOver.makeExactFilter("recipe_id", recipe_ids);
        this.po.alerts.addFilters([ recipe_id_filter ]);
    },
    settings: function() {}
};

app.init = {
    articles: function() {
        var page_size = 20;
        views.po.article_summaries = new PourOver.View("default_view", collections.po.article_summaries, {
            page_size: page_size
        });
        views.po.article_summaries.setSort("pageviews_desc");
        collections.article_comparisons.instance.metadata("sort_by", "pageviews");
        collections.article_comparisons.instance.metadata("sort_ascending", false);
        var summaries_page_one = views.po.article_summaries.getCurrentItems();
        summaries_page_one.forEach(function(summary) {
            summary["selected_for_compare"] = true;
        });
        var all_articles = collections.po.article_summaries.items, all_cids = _.pluck(all_articles, "cid");
        views.po.article_summaries.all_cids = all_cids;
        if (all_articles.length) {
            this.bloodhound = new Bloodhound({
                name: "articles",
                local: all_articles,
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace("title"),
                queryTokenizer: Bloodhound.tokenizers.whitespace
            });
            this.bloodhound.initialize();
        }
        this.instance = new this.Articles();
        views.po.article_summaries.trigger("update");
    },
    "approval-river": function() {
        var page_size = 50;
        var all_articles = pageData.articleSkeletons;
        if (all_articles.length) {
            this.bloodhound = new Bloodhound({
                name: "articles",
                local: all_articles,
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace("title"),
                queryTokenizer: Bloodhound.tokenizers.whitespace
            });
            this.bloodhound.initialize();
        }
        views.po.alerts = new PourOver.View("alerts", collections.po.alerts, {
            page_size: page_size
        });
        views.po.alerts.setSort("timestamp_desc");
        this.instance = new this.ApprovalRiver({
            model: new models.app.Model()
        });
    },
    settings: function() {
        this.instance = new this.Settings({
            model: models.org.instance
        });
    }
};

routing.init = {
    go: function(section) {
        this.router = new this.Router(section);
        Backbone.history.start();
    },
    common: function() {
        if (this.starting_route) {
            this.route("", function() {
                routing.router.navigate(this.starting_route, {
                    trigger: true
                });
            });
        }
    },
    articles: function() {
        this.route(":mode", "setModeOnly");
        this.route("compare/:ids", "compareArticles");
        this.route("detail/:id", "detailArticle");
        this.starting_route = "compare";
    },
    "approval-river": function() {
        this.route(":mode", "setModeOnly");
        this.route(":mode/:id", "loadRecipesAlerts");
        this.starting_route = "my-recipes";
    },
    settings: function() {}
};

var init = {
    common: {
        makePourOverSort: function(key) {
            return PourOver.Sort.extend({
                attr: key,
                fn: function(a, b) {
                    if (a[key] > b[key]) {
                        return -1;
                    } else if (a[key] < b[key]) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
        },
        makePourOverSortByLength: function(key) {
            return PourOver.Sort.extend({
                attr: "uqbar",
                fn: function(a, b) {
                    if (a[key].length > b[key].length) {
                        return -1;
                    } else if (a[key].length < b[key].length) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
        }
    },
    go: function() {
        var section = $("body").attr("data-section");
        templates.init[section].call(templates);
        models.init[section].call(models);
        collections.init[section].call(collections);
        app.init[section].call(app);
        routing.init.go.call(routing, section);
    }
};

init.go();
//# sourceMappingURL=main.bundled.js.map