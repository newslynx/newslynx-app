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
        ids = ids.split("&").map(function(id) {
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
    toLowerCase: function(str) {
        return str.toLowerCase();
    },
    toTitleCase: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1, str.length);
    },
    serviceFromSource: function(src) {
        return src.split("-")[0];
    },
    methodFromSource: function(src) {
        return this.prettyName(src.split("-")[1]);
    },
    prettyPrintSource: function(src) {
        src = src.replace(/-/g, " ");
        return helpers.templates.toTitleCase(src);
    },
    toUserTimezone: function(utcDate) {
        utcDate = utcDate * 1e3;
        var utc_date = new Date(utcDate), user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.orgInfo.timezone)));
        return user_timezone_date;
    },
    date: function(utcDate) {
        var user_timezone_date = helpers.templates.toUserTimezone(utcDate);
        var full_date_string = user_timezone_date.toDateString(), month_day_year_arr = full_date_string.split(" ").slice(1, 4), commafy = month_day_year_arr[0] + " " + month_day_year_arr[1] + ", " + month_day_year_arr[2];
        return commafy.replace(" 0", " ");
    },
    conciseDate: function(utcDate) {
        var user_timezone_date = helpers.templates.toUserTimezone(utcDate);
        var full_date_string = user_timezone_date.toISOString(), month_day_year_arr = full_date_string.split("T")[0];
        parts_arr = month_day_year_arr.split("-");
        return parts_arr[1] + "-" + parts_arr[2] + "-" + parts_arr[0].substr(2, 2);
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
    bakeEventCreationForm: function(recipe_id, text, link, timestamp) {
        var that = this, markup = "", schema = {}, schema_with_selects = {};
        $.extend(true, schema, pageData.eventSchema);
        var settings = {
            timestamp: timestamp,
            text: text,
            link: link
        };
        $.extend(true, settings, _.filter(pageData.accountRecipes, function(accountRecipe) {
            return accountRecipe.id === recipe_id;
        })[0].default_event);
        schema_with_selects = this.combineFormSchemaWithVals(schema, settings);
        markup = this.bakeForm(schema_with_selects);
        return markup;
    },
    bakeRecipeUpdateForm: function(id, source, settings, recipeName, schemaOrDefaultEvent) {
        var that = this, markup = "", schema = {}, schema_with_selects = {};
        $.extend(true, schema, _.filter(pageData.recipeSchemas, function(recipeSchema) {
            return recipeSchema.source == source;
        })[0][schemaOrDefaultEvent]);
        schema_with_selects = this.combineFormSchemaWithVals(schema, settings, recipeName);
        markup = this.bakeForm(schema_with_selects);
        return markup;
    },
    combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName) {
        if (schema_obj.name) schema_obj.name.selected = recipeName;
        _.each(settings_obj, function(setting, fieldName) {
            var selected_array = schema_obj[fieldName].selected || [];
            if (fieldName != "impact_tags" && fieldName != "asignee") {
                schema_obj[fieldName].selected = setting;
            } else {
                schema_obj[fieldName].selected = selected_array.concat(setting);
            }
        });
        return schema_obj;
    },
    formJsonToMarkup: {
        text: function(fieldName, fieldNamePretty, data) {
            var value = this.escapeQuotes(data.selected) || "", markup;
            markup = '<div class="form-row">';
            markup += '<div class="form-row-label-container">';
            markup += '<label for="' + fieldName + '"> ' + fieldNamePretty + "</label> ";
            markup += "</div>";
            markup += '<div class="form-row-input-container">';
            if (data.help && data.help.link) markup += '<div class="help-row"><a href="' + data.help.link + '" target="_blank">How do I search?</a></div>';
            markup += '<input type="text" name="' + fieldName + '" id="' + fieldName + '" value="' + value + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '"/>';
            markup += "</div>";
            markup += "</div>";
            return markup;
        },
        select: function(fieldName, fieldNamePretty, data) {
            var markup, that = this;
            markup = '<div class="form-row">';
            markup += '<div class="form-row-label-container">';
            markup += "<label>" + fieldNamePretty + "</label> ";
            markup += "</div>";
            markup += '<div class="form-row-input-container">';
            markup += '<select id="' + fieldName + '" name="' + fieldName + '">';
            _.each(data.options, function(option) {
                var selected = "";
                if (data.selected == option) selected = "selected";
                markup += '<option value="' + option + '" ' + selected + ">" + that.prettyName(option) + "</option>";
            });
            markup += "</select>";
            markup += "</div>";
            markup += "</div>";
            return markup;
        },
        checkbox: function(fieldName, fieldNamePretty, data) {
            var markup;
            var banished_keys = [ "Requires approval" ];
            if (!_.contains(banished_keys, fieldNamePretty)) {
                markup = '<div class="form-row">';
                markup += '<div class="form-row-label-container form-row-label-top">';
                markup += "<label>" + fieldNamePretty + "</label> ";
                markup += "</div>";
                markup += '<div class="form-row-input-container">';
                _.each(data.options, function(checkboxItem) {
                    var checkboxId = _.uniqueId("NewsLynx|checkbox|" + fieldName + "|" + checkboxItem + "|");
                    markup += '<div class="form-checkbox-group">';
                    var checked;
                    if (_.contains(data.selected, checkboxItem)) checked = "checked";
                    markup += '<input id="' + checkboxId + '" name="' + fieldName + "|" + checkboxItem + '" type="checkbox" ' + checked + "/>";
                    markup += '<label for="' + checkboxId + '">' + checkboxItem + "</label>";
                    markup += "</div>";
                });
                markup += "</div>";
                markup += "</div>";
                return markup;
            } else {
                return "";
            }
        }
    },
    bakeForm: function(schema) {
        var form = "";
        _.each(schema, function(fieldData, fieldName) {
            var field_name_pretty = this.prettyName(fieldName);
            form += this.formJsonToMarkup[fieldData.type].call(this, fieldName, field_name_pretty, fieldData);
        }, this);
        return form;
    },
    prettyName: function(name) {
        var name_changes = {
            q: "search_query"
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
    displaySearchParams: function(source, settings) {
        if (source == "google-alert") return settings.search_query; else if (source == "twitter-search") return settings.q; else if (source == "twitter-list") return settings.owner_screen_name + "," + settings.slug; else if (source == "twitter-user") return settings.screen_name; else if (source == "reddit-search") return settings.search_query; else if (source == "facebook-page") return settings.page_id; else console.error("You need to add a search_query key `templates.js` to display this type of recipe.");
    },
    getRecipeFromId: function(id) {
        return pageData.accountRecipes.filter(function(recipe) {
            return +recipe.id === id;
        })[0];
    }
};

models.alert = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/alerts",
        defaults: {
            destroy: false
        }
    })
};

models.all_alerts = {
    Model: Backbone.Model.extend({
        defaults: {
            viewing: false
        }
    })
};

models.app = {
    Model: Backbone.Model.extend({})
};

models.article_detailed = {
    Model: Backbone.Model.extend({})
};

models.article_summary = {
    Model: Backbone.Model.extend({
        defaults: {
            selected: true,
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
            viewing: false
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
    Model: Backbone.Model.extend({
        initialize: function() {
            var that = this;
            this.on("change", function() {
                var mode = this.get("mode"), current_ids = that.current_ids || false;
                if (!this[mode]) {
                    this[mode] = {};
                }
                this[mode].last_ids = current_ids;
            });
        }
    })
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
        url: "api/alerts",
        parse: function(response) {
            this.metadata("min_timetamp", response.min_timetamp);
            collections.all_alerts.instance.add(response.results);
            return response.results;
        },
        comparator: "timestamp"
    })
};

collections.all_alerts = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.alert.Model,
        metadata: helpers.modelsAndCollections.metadata,
        filterAlerts: function(idKey, searchVal) {
            var where_obj = {};
            where_obj[idKey] = searchVal;
            return this.where(where_obj);
        }
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
            this.hash = this.pluck("id").join("&");
        },
        getHash: function() {
            return this.hash;
        }
    })
};

collections.article_detailed = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_detailed.Model,
        url: "api/articles/detail",
        set: function() {
            Backbone.Collection.prototype.set.apply(this, arguments);
            console.log("here");
            this.updateHash();
            Backbone.Collection.prototype.set.apply(collections.articles_detailed.instance, arguments);
        },
        updateHash: function() {
            this.hash = this.pluck("article_id").join("&");
        },
        getHash: function() {
            console.log(this.pluck("article_id").join("&"), this.hash);
            return this.hash;
        }
    })
};

collections.article_summaries = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_summary.Model,
        url: "api/articles/summary",
        comparator: "timestamp"
    })
};

collections.articles_detailed = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.article_detailed.Model
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

collections.po = {};

collections.recipes = {
    instance: null,
    schemas_instance: null,
    Collection: Backbone.Collection.extend({
        url: "/api/recipes",
        model: models.recipe.Model,
        setBoolByIds: helpers.modelsAndCollections.setBoolByIds
    })
};

collections.subject_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.subject_tag.Model,
        url: "/api/tags/subject",
        metadata: helpers.modelsAndCollections.metadata,
        initialize: function() {
            this.metadata("filter", "subject_tags");
            return this;
        }
    })
};

collections.tag_attribute = {
    categories_instance: null,
    levels_instance: null,
    Collection: Backbone.Collection.extend({
        model: models.impact_tag.Model,
        metadata: helpers.modelsAndCollections.metadata
    })
};

app.ApprovalRiver = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click .scroll-to": "scrollTo"
    },
    initialize: function() {
        this.$drawer = $("#drawer");
        this.$content = $("#content");
        this.$listContainer = $("#river-items-container");
        this.$recipes = $("#recipes");
        this.$recipeCreators = $("#recipe-creators");
        this.$divisionSwitcher = $(".division-switcher");
        this.$viewAll = $(".view-all").parent();
        this.isotopeCntnr = "#river-items-container";
        this.isotopeChild = ".article-detail-wrapper";
        this.all_pending_alerts_count = 0;
        this.listId = "id";
        this.detailId = "recipe_id";
        this.listenTo(collections.recipes.instance, "change:viewing", this.getAssociatedAlertsForRecipe.go);
        this.listenTo(models.all_alerts.instance, "change:viewing", this.river.loadAllAlerts);
        this.listenTo(this.model, "change:view-all", this.updateViewAll);
        this.listenTo(collections.active_alerts.instance, "add", this.river.bake);
        this.listenTo(collections.active_alerts.instance, "remove", this.river.destroy);
        this.bake();
        var that = this;
        this.$content.on("scroll", function() {
            var $content = $(this);
            that.lazyLoadAlerts.call(that, $content);
        });
    },
    updateViewAll: function() {
        var viewing_all = this.model.get("view-all"), selected_recipes;
        if (viewing_all) {
            models.all_alerts.instance.set("viewing", true);
            selected_recipes = collections.recipes.instance.where({
                viewing: true
            });
            if (selected_recipes.length) {
                collections.recipes.instance.where({
                    viewing: true
                })[0].set("viewing", false);
            }
        } else {
            models.all_alerts.instance.set("viewing", false);
        }
    },
    bake: function() {
        collections.recipes.instance.each(function(recipe) {
            var recipe_view = new views.Recipe({
                model: recipe
            });
            this.$recipes.append(recipe_view.render().el);
            this.all_pending_alerts_count += recipe.get("pending");
        }, this);
        collections.recipes.schemas_instance.each(function(recipeCreator) {
            var recipe_creator_view = new views.RecipeSchemaListItem({
                model: recipeCreator
            });
            this.$recipeCreators.append(recipe_creator_view.render().el);
        }, this);
        collections.recipes.schemas_instance.each(function(recipeSchema) {
            var recipe_schema_form_view = new views.RecipeSchemaForm({
                model: recipeSchema
            });
            this.$content.append(recipe_schema_form_view.render().el);
        }, this);
        new views.DivisionSwitcher({
            model: models.section_mode,
            el: this.$divisionSwitcher
        });
        new views.LoadAllDrawerItems({
            model: models.all_alerts.instance,
            el: this.$viewAll
        });
        app.helpers.isotope.initCntnr.call(this);
        return this;
    },
    scrollTo: function(e) {
        var dest = $(e.currentTarget).attr("data-destination");
        this.$content.animate({
            scrollTop: this.$content.scrollTop() + $("#" + dest + "-recipe").position().top - parseFloat(this.$content.css("padding-top"))
        }, 200);
    },
    getAssociatedAlertsForRecipe: {
        go: function(recipeModel) {
            var is_new = recipeModel.get("viewing"), recipe_id, pending, min_timestamp;
            if (is_new) {
                recipe_id = recipeModel.get(this.listId);
                pending = recipeModel.get("pending");
                min_timestamp = collections.all_alerts.instance.metadata("timestamp");
                this.getAssociatedAlertsForRecipe.fetch.call(this, recipe_id, pending, min_timestamp);
            }
            return this;
        },
        fetch: function(recipe_id, pending, minTimestamp) {
            var page_limit = 5, options = {
                data: {
                    before: minTimestamp,
                    recipe_id: recipe_id
                }
            }, that = this, cb = that.getAssociatedAlertsForRecipe.cleanupFetch;
            var mode = models.section_mode.get("mode");
            var loaded_matches = collections.all_alerts.instance.filterAlerts(app.instance.detailId, recipe_id);
            if (loaded_matches.length && mode != "my-recipes" || mode == "my-recipes" && (loaded_matches.length >= page_limit || loaded_matches.length == pending)) {
                collections.active_alerts.instance.set(loaded_matches);
                cb(null, null, options, pending);
                app.helpers.isotope.relayout();
            } else {
                _.extend(options, {
                    processData: true,
                    success: function(collection, response, options) {
                        cb(collection, response, options, pending);
                    },
                    error: function(err) {
                        console.log("Error fetching " + recipe_id);
                    }
                });
                collections.active_alerts.instance.fetch(options);
            }
        },
        cleanupFetch: function(collection, results, options, pending) {
            collections.active_alerts.instance.metadata("active_recipe_id", options.data.recipe_id);
            collections.active_alerts.instance.metadata("active_recipe_id_pending", pending);
            app.instance.$isotopeCntnr.isotope("layout");
        }
    },
    divisionSwitcher: {
        updateHash: function(entering_mode) {
            var exiting_hash = window.location.hash, exiting_mode = routing.helpers.getMode(exiting_hash), exiting_ids = routing.helpers.getArticleIds(exiting_hash), previous_ids = models.section_mode.get("previous-ids") || "";
            var entering_hash = entering_mode;
            if (exiting_mode == "my-recipes" && exiting_ids) {
                models.section_mode.set("previous-ids", exiting_ids);
            } else if (exiting_mode == "create-new" && previous_ids) {
                entering_hash += "/" + previous_ids;
            }
            routing.router.navigate(entering_hash, {
                trigger: true
            });
        }
    },
    river: {
        bake: function(detailModel) {
            var item_view, item_el;
            if (detailModel.set("destroy") === false) {
                detailModel.set({
                    destroy: false
                }, {
                    silent: true
                });
            }
            item_view = new views.Alert({
                model: detailModel
            });
            item_el = item_view.render().el;
            this.$listContainer.append(item_el);
            app.helpers.isotope.addItem.call(app.instance, item_el);
            return this;
        },
        destroy: function(detailModel) {
            var viewing_all = app.instance.model.get("viewing_all");
            if (!viewing_all) {
                detailModel.set("destroy", "delete");
            }
            return this;
        },
        loadAllAlerts: function(loadAllModel) {
            var load_all = loadAllModel.get("viewing"), section_mode, min_timestamp;
            if (load_all) {
                min_timestamp = collections.all_alerts.instance.metadata("timestamp", min_timestamp);
                collections.active_alerts.instance.metadata("min_timestamp", min_timestamp);
                collections.active_alerts.instance.metadata("active_recipe_id", "all");
                collections.active_alerts.instance.metadata("active_recipe_id_pending", this.all_pending_alerts_count);
                collections.active_alerts.instance.set(collections.all_alerts.instance.models);
                app.helpers.isotope.relayout();
            }
        }
    },
    lazyLoadAlerts: function($content) {
        var that = this;
        var content_scrollHeight = $content[0].scrollHeight, content_scrollTop = $content.scrollTop(), content_outerHeight = $content.outerHeight(), at_bottom = content_scrollHeight - content_scrollTop == content_outerHeight;
        var active_alerts_count = collections.active_alerts.instance.length, pending_alerts_count = collections.active_alerts.instance.metadata("active_recipe_id_pending"), we_dont_have_all_the_models = active_alerts_count < pending_alerts_count;
        var min_timestamp = collections.active_alerts.instance.metadata("min_timestamp"), active_recipe_id = collections.active_alerts.instance.metadata("active_recipe_id");
        var options = {};
        console.log("lazy load check. at bottom:", at_bottom, "; we dont have all the models:", we_dont_have_all_the_models);
        if (at_bottom && we_dont_have_all_the_models) {
            options = {
                remove: false,
                processData: true,
                data: {
                    before: min_timestamp
                },
                success: function(collection, results, options) {
                    console.log("lazy fetch successeful");
                    that.getAssociatedAlertsForRecipe.cleanupFetch(collection, results, options);
                },
                error: function(err) {
                    console.log("Error fetching " + recipe_id);
                }
            };
            if (active_recipe_id != "all") {
                options.data.recipe_id = active_recipe_id;
            }
            collections.active_alerts.instance.fetch(options);
        }
    }
});

app.Articles = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click .add-to-comparison": "addToComparison",
        "click .option-title .show-hide": "showHideList"
    },
    initialize: function() {
        this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
        this.$impactTagCategoriesList = $('.option-container[data-type="impact-tag-categories"] .tag-list');
        this.$impactTagLevelsList = $('.option-container[data-type="impact-tag-levels"] .tag-list');
        this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
        this.$articleList = $("#article-list");
        this.$drawer = $("#drawer");
        this.$content = $("#content");
        this.$divisionSwitcher = $(".division-switcher");
        this.$drawerPointersCntnr = $("#drawer-pointers-container");
        this.isotopeCntnr = ".rows";
        this.isotopeChild = ".article-detail-row-wrapper";
        this.listId = "id";
        this.detailId = "article_id";
        this.listenTo(models.section_mode, "change:mode", this.sectionMode.update);
        this.listenTo(collections.subject_tags.instance, "change:active", this.drawer.filter);
        this.listenTo(collections.impact_tags.instance, "change:active", this.drawer.filter);
        this.listenTo(collections.tag_attribute.categories_instance, "change:active", this.drawer.filter);
        this.listenTo(collections.tag_attribute.levels_instance, "change:active", this.drawer.filter);
        views.po.article_summaries.on("update", this.drawer.setActiveArticleSummaries);
        this.listenTo(collections.article_summaries.instance, "add", this.drawer.add);
        this.listenTo(collections.article_summaries.instance, "remove", this.drawer.remove);
        this.listenTo(collections.article_comparisons.instance, "add", this.comparison.add);
        this.listenTo(collections.article_comparisons.instance, "remove", this.comparison.remove);
        this.listenTo(collections.article_detailed.instance, "add", this.detail.add);
        this.listenTo(collections.article_detailed.instance, "remove", this.detail.remove);
        this.bake();
    },
    bake: function() {
        this.$drawerPointersCntnr.append(templates.drawerPointers);
        collections.subject_tags.instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$subjectTagList.append(tag_view.render().el);
        }, this);
        collections.tag_attribute.categories_instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$impactTagCategoriesList.append(tag_view.render().el);
        }, this);
        collections.tag_attribute.levels_instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$impactTagLevelsList.append(tag_view.render().el);
        }, this);
        collections.impact_tags.instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$impactTagList.append(tag_view.render().el);
        }, this);
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
        return this;
    },
    sectionMode: {
        update: function(model, mode) {
            mode = mode || model.get("mode");
            this.sectionMode[mode].call(this, model, mode);
            return this;
        },
        compare: function(model, mode) {
            var article_grid = new views.ArticleComparisonGrid();
            this.$content.html(article_grid.render().el);
            this.$listContainer = $("#compare-grid .rows");
            app.helpers.isotope.initCntnr.call(this);
            var sort_by = collections.article_comparisons.instance.metadata("sort_by") || "timestamp", sort_ascending = collections.article_comparisons.instance.metadata("sort_ascending") || true;
            $(".header-el").attr("data-sort-ascending", sort_ascending);
            var compare_models = collections.article_comparisons.instance.models;
            if (!compare_models.length) {
                compare_models = collections.article_summaries.instance.where({
                    selected: true
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
            var that = this;
            this.$content.html("");
            this.detail.loadModel(function(model) {
                collections.article_detailed.instance.reset();
                collections.article_detailed.instance.set(model);
                that.saveHash();
            });
        }
    },
    divisionSwitcher: {
        updateCollection: function() {
            return this;
        }
    },
    drawer: {
        filter: function(tagModel, isActive) {
            var filter = tagModel.collection.metadata("filter"), query_value = tagModel.get("id") || tagModel.get("name").toLowerCase();
            if (isActive) {
                collections.po.article_summaries.filters[filter].intersectQuery(query_value);
            } else {
                collections.po.article_summaries.filters[filter].removeSingleQuery(query_value);
            }
            return this;
        },
        setActiveArticleSummaries: function() {
            var current_filtered_set = views.po.article_summaries.getCurrentItems();
            collections.article_summaries.instance.set(current_filtered_set);
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
            selected: true
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
    },
    comparison: {
        add: function(summaryModel) {
            var item_view, item_el;
            item_view = new views.ArticleSummaryRow({
                model: summaryModel
            });
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
            item_view = new views.ArticleDetail({
                model: detailModel
            });
            item_el = item_view.render().el;
            this.$content.html(item_el);
            return this;
        },
        remove: function(detailModel) {
            detailModel.set("destroy", true);
            return this;
        },
        loadModel: function(cb) {
            var detail_model, detail_model_id, fetch_options = {
                data: {},
                processData: true,
                success: function(collection, response, options) {
                    cb(response);
                },
                error: function(err) {
                    console.log("Error fetching article detail" + detail_model_id);
                }
            };
            if (collections.article_detailed.instance.length) {
                detail_model = collections.article_detailed.instance.first();
            } else if (false) {} else {
                detail_model_id = collections.article_comparisons.instance.first().get("id");
                fetch_options.data.article_id = detail_model_id;
            }
            if (!detail_model) {
                detail_model = collections.articles_detailed.instance.findWhere({
                    article_id: detail_model_id
                });
            }
            if (detail_model) {
                cb(detail_model);
            } else {
                collections.article_detailed.instance.fetch(fetch_options);
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
        articles: [ "#1f78b4", "#33a02c", "#e31a1c", "#ff7f00", "#6a3d9a", "#b15928", "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6" ],
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
            new_item.placeholder0 = placeholders[0];
            new_item.placeholder1 = placeholders[1];
            $inputsContainer.append(templates.multiInputDoubleFactory(new_item));
        } else if ($inputsContainer.attr("data-layout") == "impact-tags") {
            new_item.placeholder = $inputsContainer.attr("data-placeholder");
            $newItem = $(templates.impactTagInputFactory(new_item));
            $newItem.appendTo($inputsContainer);
            this.initColorPicker($newItem);
        } else {
            new_item.placeholder = $inputsContainer.attr("data-placeholder");
            $newItem = $(templates.multiInputFactory(new_item));
            $newItem.appendTo($inputsContainer);
            if (new_item.flag == "color") {
                this.initColorPicker($newItem);
            }
        }
    },
    removeItem: function(e) {
        var $thisInput = $(e.currentTarget).parents("li.input.multi");
        $thisInput.remove();
    },
    saveDataToServer: function() {
        var settings = this.getSettingsData();
        var valid = this.validateSettings(settings);
        if (valid) {
            console.log("Posting settings...", settings);
            this.model.save(settings, {
                error: function(model, response, options) {
                    console.log("error in model save", response);
                },
                success: function(model, response, options) {
                    console.log("saved in model save", response);
                }
            });
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
        alert(msg);
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
                    "time-on-page": "[data-time-on-page] parseFloat",
                    internal: "[data-internal] parseFloat",
                    external: "[data-external] parseFloat",
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

views.Alert = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper modal-parent",
    events: {
        'click .approval-btn-container[data-which="no"]': "makeInsignificant",
        'click .approval-btn-container[data-which="yes"]': "toggleModal",
        "click .cancel": "toggleModal",
        "click .modal-overlay": "toggleModal",
        "submit form": "saveModal"
    },
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy);
    },
    render: function() {
        var model_json = this.model.toJSON();
        var river_item_markup = templates.alertFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(river_item_markup);
        this.$el.attr("data-timestamp", model_json.timestamp);
        this.$form = this.$el.find("form");
        return this;
    },
    toggleModal: function(e) {
        views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        e.preventDefault();
        var that = this;
        var alert_data = this.remodelFormJson();
        var new_event_model = new models.event.Model();
        new_event_model.save(alert_data, {
            error: function(model, response, options) {
                console.log("error in recipe creatin", response);
            },
            success: function(model, response, options) {
                console.log("saved recipe", response);
                that.removeItem("save");
                views.helpers.toggleModal(e);
            }
        });
    },
    remodelFormJson: function() {
        var serializedArray = this.$form.serializeArray();
        var model_json = views.helpers.remodelEventJson(this.model.id, serializedArray);
        return model_json;
    },
    makeInsignificant: function(itemModel) {
        var that = this;
        this.model.destroy({
            success: function(model, response) {
                that.removeItem(true);
            },
            error: function(error) {
                console.log("Error deleting event.", error);
            }
        });
    },
    removeItem: function(mode) {
        this.model.set("destroy", mode);
    },
    destroy: function() {
        var destroy_mode = this.model.get("destroy");
        if (destroy_mode === true) {
            if (app.instance.$isotopeCntnr) {
                app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout");
            } else {
                this.remove();
            }
        } else if (destroy_mode == "delete") {
            if (app.instance.$isotopeCntnr) {
                app.instance.$isotopeCntnr.isotope("remove", this.$el);
            } else {
                this.remove();
            }
        } else if (destroy_mode == "save") {
            if (app.instance.$isotopeCntnr) {
                app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout");
            } else {
                this.remove();
            }
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
        this.sortAscending = true;
    },
    render: function() {
        var grid_markup = templates.articleGridContainerMarkup;
        this.$el.html(grid_markup);
        return this;
    },
    sortColumn: function(e) {
        var $this = $(e.currentTarget);
        if ($this.hasClass("active")) {
            this.sortAscending = !this.sortAscending;
        }
        $(".header-el").removeClass("active");
        $this.addClass("active");
        var metric = $this.attr("data-metric");
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
        app.instance.saveHash();
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
    }
});

views.ArticleDetail = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper",
    events: {},
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy);
        this.chartSelector = "#ST-chart";
        this.formatDate = d3.time.format("%Y-%m-%d %X");
        this.legend = {
            facebook_likes: {
                service: "Facebook",
                metric: "likes",
                color: "#3B5998",
                group: "a"
            },
            twitter_shares: {
                service: "Twitter",
                metric: "mentions",
                color: "#55ACEE",
                group: "a"
            },
            pageviews: {
                service: "",
                metric: "pageviews",
                color: "#fc0",
                group: "b"
            }
        };
        this.eventsData = this.model.toJSON().events;
        this.timeseriesData = this.model.toJSON().timeseries_stats;
        var that = this;
        this.spottedTail = spottedTail().x(function(d) {
            var utc_date = that.formatDate.parse(d.timestamp), user_timezone_date = new Date(utc_date.setHours(utc_date.getHours() + parseFloat(pageData.org.timezone)));
            return user_timezone_date;
        }).y(function(d) {
            return +d.count;
        }).legend(this.legend).eventSchema(pageData.eventSchemas).events(this.eventsData).onBrush(this.filterEventsByDateRange);
    },
    render: function() {
        var article_detail_markup = templates.articleDetailFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(article_detail_markup);
        return this;
    },
    bakeInteractiveBits: function() {
        this.bakeChart();
        this.bakeEventGallery;
    },
    bakeChart: function() {
        d3.select(this.chartSelector).datum(this.timeseriesData).call(this.spottedTail);
    },
    bakeEventGallery: function() {},
    filterEventsByDateRange: function(dateRange) {
        console.log(dateRange);
    },
    destroy: function() {
        if (this.model.get("destroy")) {
            this.remove();
        }
    }
});

views.ArticleSummaryDrawer = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    events: {
        "click .drawer-list-outer:not(active)": "toggleSelected"
    },
    initialize: function() {
        this.listenTo(this.model, "change:selected", this.setActiveCssState);
        this.listenTo(this.model, "change:in_drawer", this.destroy);
    },
    render: function() {
        var drawer_list_item_markup = templates.articleSummaryDrawerFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        this.setActiveCssState();
        return this;
    },
    toggleSelected: function() {
        this.model.set("selected", !this.model.get("selected"));
        return this;
    },
    setActiveCssState: function() {
        var selected = this.model.get("selected");
        if (selected) {
            this.$el.find(".drawer-list-outer").toggleClass("active", this.model.get("selected"));
            this.$el.find(".inputs-container input").prop("checked", this.model.get("selected"));
        } else {
            this.$el.find(".drawer-list-outer").toggleClass("active", false);
            this.$el.find(".inputs-container input").prop("checked", false);
        }
        return this;
    },
    destroy: function(mode, inDrawer) {
        if (!inDrawer) {
            this.remove();
        }
    }
});

views.ArticleSummaryRow = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-row-wrapper",
    events: {
        "click .title": "goToDetail",
        "click .destroy": "close"
    },
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy);
    },
    render: function() {
        var $el = this.$el, model_json = this.model.toJSON(), article_detail_markup = templates.articleSummaryRowFactory(_.extend(model_json, helpers.templates));
        this.$el.html(article_detail_markup);
        this.$el.attr("data-title", model_json.title).attr("data-timestamp", model_json.timestamp);
        this.data = this.transformData(this.model.toJSON());
        _.each(this.data.quant_metrics, function(bullet) {
            $el.attr("data-" + bullet.metric, bullet.count);
        });
        $el.attr("data-subject-tags", this.data.subject_tags.length);
        $el.attr("data-impact-tags", this.data.impact_tags.length);
        this._el = d3.select(this.el).select(".article-detail-row-container").selectAll(".cell");
        this.update();
        return this;
    },
    transformData: function(modelData) {
        var tag_columns = [], chunk = 4;
        for (var i = 0; i < modelData.subject_tags_full.length; i += chunk) {
            tag_columns.push(modelData.subject_tags_full.slice(i, i + chunk));
        }
        modelData.subject_tags_grouped = tag_columns;
        modelData.impact_tags_grouped = d3.nest().key(function(d) {
            return d.category;
        }).entries(modelData.impact_tags_full);
        return modelData;
    },
    update: function(cb) {
        var row = this._el.data([ this.data ]).enter();
        row.append("div").classed("cell", true).classed("title", true).classed("wide", true).attr("data-id", function(d) {
            return d.id;
        }).html(function(d) {
            return d.id;
        });
        row.append("div").classed("cell", true).classed("date", true).classed("single", true).attr("data-timestamp", function(d) {
            return d.timestamp;
        }).html(function(d) {
            return helpers.templates.conciseDate(d.timestamp);
        });
        var bullet_container = this._el.data(this.data.quant_metrics).enter().append("div").classed("cell", true).classed("multi", true).classed("gfx", true).on("mouseenter", function(d) {
            console.log(d);
        }).append("div").classed("bullet-container", true);
        var that = this;
        bullet_container.append("div").classed("bullet", true).style("width", function(d) {
            return that.helpers.calcSize(d, "count");
        });
        var subject_bar_container = row.append("div").classed("cell", true).classed("bars", true).classed("gfx", true).append("div").classed("bar-container", true).attr("data-group", "subject-tags");
        subject_bar_container.selectAll(".bar-column").data(this.data.subject_tags_grouped).enter().append("div").classed("bar-column", true).selectAll(".bar").data(function(d) {
            return d;
        }).enter().append("div").classed("bar", true).style("background-color", function(d) {
            return d.color;
        }).on("mouseenter", function(d) {
            console.log(d);
        });
        var impact_bar_container = row.append("div").classed("cell", true).classed("bars", true).classed("gfx", true).append("div").classed("bar-container", true).attr("data-group", "impact-tags");
        var impact_bar_column = impact_bar_container.selectAll(".bar-column").data(this.data.impact_tags_grouped).enter().append("div").classed("bar-column", true);
        impact_bar_column.selectAll(".bar").data(function(d) {
            return d.values;
        }).enter().append("div").classed("bar", true).style("background-color", function(d) {
            return d.color;
        }).on("mouseenter", function(d) {
            console.log(d);
        });
    },
    updateBulletMarker: function() {},
    goToDetail: function(e) {
        var article_id = $(e.currentTarget).attr("data-article_id");
        app.instance.divisionSwitcher.updateHash("single", article_id);
    },
    close: function() {
        collections.article_comparisons.instance.remove(this.model);
        app.instance.saveHash();
    },
    destroy: function(model, destroyMode) {
        if (destroyMode == "delete") {
            if (app.instance.$isotopeCntnr) {
                app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout");
            } else {
                this.remove();
            }
            model.set({
                destroy: false
            }, {
                silent: true
            });
        }
    },
    helpers: {
        calcSize: function(d, value) {
            var val = d[value];
            var max = pageData.orgInfo.metric_maxes.filter(function(f) {
                return f.metric = d.metric;
            })[0].max;
            var scale = d3.scale.linear().domain([ 0, max ]).range([ 1, 100 ]);
            return scale(val).toString() + "%";
        }
    }
});

views.DivisionSwitcher = Backbone.View.extend({
    events: {
        "click li": "setHash"
    },
    initialize: function() {
        this.listenTo(this.model, "change:mode", this.updateActiveState);
        this.updateActiveState();
    },
    setHash: function(e) {
        var $el = $(e.currentTarget);
        if (!$el.hasClass("active")) {
            var mode = $el.attr("data-mode");
            this.model.set("mode", mode);
        }
        return this;
    },
    updateActiveState: function() {
        var mode = this.model.get("mode");
        $("#drawer").attr("data-mode", mode);
        $("#content").attr("data-mode", mode);
        this.$el.find("li").removeClass("active");
        this.$el.find('li[data-mode="' + mode + '"]').addClass("active");
        $('.mode-content[data-mode="' + mode + '"]').show();
        $('.mode-content[data-mode!="' + mode + '"]').hide();
        return this;
    }
});

views.LoadAllDrawerItems = Backbone.View.extend({
    events: {
        "click .view-all:not(.active)": "setHash"
    },
    initialize: function() {
        this.listenTo(this.model, "change:viewing", this.setActiveCssState);
        this.$drawerListOuter = this.$el.find(".drawer-list-outer");
    },
    setHash: function() {
        routing.router.navigate("my-recipes", {
            trigger: true
        });
        return this;
    },
    setActiveCssState: function() {
        var active = this.model.get("viewing");
        this.$drawerListOuter.toggleClass("active", active);
        this.$drawerListOuter.find("input").prop("checked", active);
    }
});

views.Recipe = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    events: {
        "click .drawer-list-outer:not(active)": "setHash",
        "click .enable-switch": "toggleEnabled",
        "click .cancel": "toggleModal",
        "click .settings-switch": "toggleModal",
        "click .modal-overlay": "toggleModal",
        "submit form": "saveModal",
        "click .destroy": "destroyModel",
        "click .toggle-default-event": "toggleDefaults"
    },
    initialize: function() {
        this.listenTo(this.model, "change:viewing", this.setActiveCssState);
        this.listenTo(this.model, "change:enabled", this.renderEnabled);
        this.listenTo(this.model, "change:set_default_event", this.showHideDefaults);
        this.modalOpen = false;
        this.pending = this.model.get("pending");
    },
    render: function() {
        var drawer_list_item_markup = templates.recipeFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        this.$form = this.$el.find("form");
        this.$defaultEvents = this.$el.find(".default-event-container");
        this.$defautEventsBtn = this.$el.find(".toggle-default-event");
        this.$submitMsg = this.$el.find(".submit-msg");
        return this;
    },
    renderEnabled: function() {
        var enabled = this.model.get("enabled");
        this.$el.find(".enable-switch").attr("data-enabled", enabled).html(helpers.templates.formatEnabled(enabled));
    },
    toggleModal: function(e) {
        this.killEvent(e);
        this.modalOpen = !this.modalOpen;
        views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        var that = this;
        e.preventDefault();
        var recipe_data = this.remodelRecipeJson();
        this.model.save(recipe_data, {
            error: function(model, response, options) {
                console.log("error in recipe update", response);
                alert("Your update did not succeed. Please try again. Check the console for errors.");
            },
            success: function(model, response, options) {
                console.log("updated recipe", response);
                that.toggleModal(e);
            }
        });
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
    },
    remodelRecipeJson: function() {
        var serializedArray = this.$form.serializeArray(), recipe_info = {
            source: this.model.get("source"),
            type: this.model.get("type"),
            set_default_event: this.model.get("set_default_event")
        };
        var model_json = views.helpers.remodelRecipeJson.update(recipe_info, serializedArray);
        return model_json;
    },
    toggleEnabled: function(e) {
        this.killEvent(e);
        this.model.set("enabled", !this.model.get("enabled"));
    },
    killEvent: function(e) {
        e.stopPropagation();
    },
    setActiveCssState: function(model) {
        var ids = routing.helpers.getArticleIds(window.location.hash);
        if (ids) {
            this.$el.find(".drawer-list-outer").toggleClass("active", model.get("viewing"));
            this.$el.find(".inputs-container input").prop("checked", model.get("viewing"));
        } else {
            this.$el.find(".drawer-list-outer").toggleClass("active", false);
            this.$el.find(".inputs-container input").prop("checked", false);
        }
        return this;
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
    },
    setHash: function() {
        if (!this.modalOpen) {
            var behavior = app.helpers.drawer.determineBehavior();
            routing.router.set[behavior](this.model.get(app.instance.listId));
            return this;
        }
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
        this.listenTo(this.model, "change:destroy", this.destroy);
        this.listenTo(this.model, "change:set_default_event", this.showHideDefaults);
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
        return this;
    },
    save: function(e) {
        e.preventDefault();
        var that = this;
        var recipe_data = this.remodelRecipeJson();
        var new_recipe_creator_model = new models.recipe_creator.Model();
        new_recipe_creator_model.save(recipe_data, {
            error: function(model, response, options) {
                console.log("error in recipe creatin", response);
                that.flashResult("error");
            },
            success: function(model, response, options) {
                console.log("saved recipe", response);
                that.flashResult(null);
            }
        });
    },
    flashResult: function(error) {
        var animation_duration = 650;
        if (!error) {
            this.$el.css("background-color", "#D0F1D1").animate({
                "background-color": "#fff"
            }, animation_duration);
            this.render();
            this.printSubmitMsg(null, "Recipe saved! Refresh your recipe list to see it.");
        } else {
            this.$el.css("background-color", "#FFD0D0").animate({
                "background-color": "#fff"
            }, animation_duration);
            this.printSubmitMsg("error", "Meow! There was an error!");
        }
    },
    printSubmitMsg: function(error, msg) {
        var class_name = "success";
        if (error) class_name = "fail";
        this.$submitMsg.addClass(class_name).html(msg);
    },
    remodelRecipeJson: function() {
        var serializedArray = this.$form.serializeArray(), recipe_info = {
            source: this.model.get("source"),
            type: this.model.get("type"),
            set_default_event: this.model.get("set_default_event")
        };
        var model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray);
        return model_json;
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
    initialize: function() {},
    render: function() {
        var drawer_list_item_markup = templates.recipeSchemaListItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(drawer_list_item_markup);
        return this;
    }
});

views.Tag = Backbone.View.extend({
    tagName: "li",
    className: "tag-wrapper",
    events: {
        click: "toggle"
    },
    initialize: function() {
        this.listenTo(this.model, "change:active", this.styleLayout);
    },
    render: function() {
        var tag_markup = templates.tagFactory(_.extend(this.model.toJSON(), helpers.templates));
        this.$el.html(tag_markup);
        this.styleLayout();
        return this;
    },
    styleLayout: function() {
        var is_active = this.model.get("active"), bg_color = this.model.get("color"), set_bg_color = "auto", set_text_color = "auto";
        this.$el.find(".tag-container").css("border-left-color", bg_color);
        if (is_active) {
            set_bg_color = bg_color;
            set_text_color = this.whiteOrBack(set_bg_color);
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
    },
    whiteOrBack: function(bgColorHex) {
        rgbColor = this.hexToRgb(bgColorHex);
        var r = rgbColor.r, g = rgbColor.g, b = rgbColor.b;
        var yiq = (r * 299 + g * 587 + b * 114) / 1e3;
        console.log(yiq);
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
            if (inputObj.name.indexOf("impact_tags|") != -1 || inputObj.name.indexOf("asignee|") != -1) {
                name_parts = inputObj.name.split("|");
                inputObj.name = name_parts[0];
                inputObj.value = name_parts[1];
            }
            return inputObj;
        });
        var inputObj = d3.nest().key(function(d) {
            return d.name;
        }).rollup(function(list) {
            if (list.length == 1 && list[0].name != "impact_tags") return list[0].value; else return list.map(function(f) {
                return f.value;
            });
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
        if (input_obj.impact_tags.length) {
            input_obj.impact_tags = input_obj.impact_tags.map(function(impactTag) {
                return pageData.org.impact_tags.filter(function(iT) {
                    return iT.name === impactTag;
                })[0].id;
            });
        }
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
        loadRecipe: function(mode, ids) {
            mode = mode.replace(/\//g, "");
            ids = routing.helpers.diffIds.call(this, mode, ids);
            if (mode == "my-recipes") {
                app.instance.model.set("view-all", false);
            }
            this.setModeOnly(mode);
            if (ids.exiting) this.addRemove.call(app.instance, mode, ids.exiting, false);
            if (ids.entering) this.addRemove.call(app.instance, mode, ids.entering, true);
        },
        loadAllInSection: function(mode) {
            this.setModeOnly(mode);
            this.enableAll.call(app.instance);
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
                compare_models = ids.split("&").map(function(id) {
                    return collections.article_summaries.instance.findWhere({
                        id: id
                    });
                });
                collections.article_comparisons.instance.set(compare_models, {
                    merge: true
                });
            }
        },
        addRemove: function(mode, ids, show) {
            if (ids) {
                collections.recipes.instance.setBoolByIds("viewing", this.listId, ids, show);
            }
        },
        enableAll: function() {
            app.instance.model.set("view-all", true);
            models.all_alerts.instance.set("viewing", true);
        },
        set: {
            radio: function(id, trigger) {
                if (_.isUndefined(trigger)) trigger = true;
                routing.router.navigate(models.section_mode.get("mode") + "/" + id, {
                    trigger: trigger
                });
            },
            checkbox: function(articleId) {
                var hash = window.location.hash, hash_test = routing.helpers.getArticleIds(hash), exists = routing.helpers.exists(hash, articleId);
                if (!exists) {
                    if (hash_test) {
                        hash += "&";
                    } else if (hash.substr(hash.length - 1, 1) != "/") {
                        hash += "/";
                    }
                    hash += articleId;
                } else {
                    hash = hash.replace(new RegExp("(&|)" + articleId, "g"), "").replace("/&", "/");
                }
                routing.router.navigate(hash, {
                    trigger: true
                });
            }
        }
    }),
    helpers: {
        diffIds: function(mode, newIds) {
            var obj = {};
            if (mode == "create-new") {
                return false;
            }
            if (!this.history.length || !this.history[this.history.length - 1].ids) {
                if (!this.history[this.history.length - 2] || mode == "my-recipes") {
                    obj.entering = newIds;
                    return obj;
                } else {
                    return {};
                }
            }
            var previous_ids = this.history[this.history.length - 1].ids.split("&"), newIds = newIds.split("&"), previous_ids_sorted = previous_ids.concat().sort(helpers.common.sortNumber), newIds_sorted = newIds.concat().sort(helpers.common.sortNumber), previous_mode = this.history[this.history.length - 1].mode;
            if (mode == "my-recipes" && !previous_ids) previous_ids = app.helpers.drawer.getAllIds.call(app.instance);
            if (mode == "my-recipes") {
                obj.entering = newIds.join("&");
                obj.exiting = previous_ids.join("&");
            }
            return obj;
        },
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
    },
    "approval-river": function() {
        this.recipeFactory = _.template($("#recipe-templ").html());
        this.recipeSchemaListItemFactory = _.template($("#recipe-schema-list-item-templ").html());
        this.recipeSchemaFormFactory = _.template($("#recipe-schema-form-templ").html());
        this.alertFactory = _.template($("#alert-templ").html());
    },
    settings: function() {
        this.settingsFactory = _.template($("#settings-templ").html());
        this.impactTagInputFactory = _.template($("#impact-tag-input-templ").html());
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
        this.section_mode.set("mode", "my-recipes");
        this.all_alerts.instance = new this.all_alerts.Model();
    },
    settings: function() {
        this.org.instance = new this.org.Model(pageData.org);
    }
};

collections.init = {
    articles: function() {
        this.subject_tags.instance = new this.subject_tags.Collection(pageData.subject_tags);
        this.tag_attribute.categories_instance = new this.tag_attribute.Collection(pageData.impact_tag_categories);
        this.tag_attribute.levels_instance = new this.tag_attribute.Collection(pageData.impact_tag_levels);
        this.tag_attribute.categories_instance.metadata("filter", "impact_tag_categories");
        this.tag_attribute.levels_instance.metadata("filter", "impact_tag_levels");
        this.impact_tags.instance = new this.impact_tags.Collection(pageData.impact_tags);
        this.po.article_summaries = new PourOver.Collection(pageData.articleSummaries);
        var subject_tag_ids = pageData.subject_tags.map(function(subject_tag) {
            return subject_tag.id;
        }), impact_tag_ids = pageData.impact_tags.map(function(impact_tag) {
            return impact_tag.id;
        }), impact_tag_category_names = pageData.impact_tag_categories.map(function(impact_tag_category) {
            return impact_tag_category.name.toLowerCase();
        }), impact_tag_level_names = pageData.impact_tag_levels.map(function(impact_tag_level) {
            return impact_tag_level.name.toLowerCase();
        });
        var subject_tags_filter = PourOver.makeInclusionFilter("subject_tags", subject_tag_ids), impact_tags_filter = PourOver.makeInclusionFilter("impact_tags", impact_tag_ids), impact_tag_category_filter = PourOver.makeInclusionFilter("impact_tag_categories", impact_tag_category_names), impact_tag_level_filter = PourOver.makeInclusionFilter("impact_tag_levels", impact_tag_level_names);
        this.po.article_summaries.addFilters([ subject_tags_filter, impact_tags_filter, impact_tag_category_filter, impact_tag_level_filter ]);
        this.article_summaries.instance = new this.article_summaries.Collection(pageData.articleSummaries);
        this.article_comparisons.instance = new this.article_comparisons.Collection([]);
        this.articles_detailed.instance = new this.articles_detailed.Collection(pageData.articleDetails);
        this.article_detailed.instance = new this.article_detailed.Collection([]);
    },
    "approval-river": function() {
        this.recipes.instance = new this.recipes.Collection(pageData.accountRecipes);
        this.recipes.schemas_instance = new this.recipes.Collection(pageData.recipeSchemas);
        this.active_alerts.instance = new this.active_alerts.Collection([]);
        this.all_alerts.instance = new this.all_alerts.Collection(pageData.alerts.results);
        this.all_alerts.instance.metadata("timestamp", pageData.alerts.min_timestamp);
    },
    settings: function() {}
};

app.init = {
    articles: function() {
        views.po.article_summaries = new PourOver.View("default_view", collections.po.article_summaries);
        this.instance = new this.Articles();
    },
    "approval-river": function() {
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
        this.starting_route = "compare";
    },
    "approval-river": function() {
        this.route(":mode", "loadAllInSection");
        this.route(":mode/:id", "loadRecipe");
        this.starting_route = "my-recipes";
    },
    settings: function() {}
};

var init = {
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