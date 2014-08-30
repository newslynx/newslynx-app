var helpers = helpers || {}, templates = templates || {}, models = models || {}, collections = collections || {}, app = app || {}, views = views || {}, routing = routing || {};

helpers.common = {
    sortNumber: function(a, b) {
        return a - b;
    }
}, helpers.modelsAndCollections = {
    toggle: function(key) {
        this.set(key, !this.get(key));
    },
    getTrue: function(key) {
        var where_obj = {};
        return where_obj[key] = !0, this.where(where_obj);
    },
    zeroOut: function(key) {
        this.getTrue(key).forEach(function(model) {
            model.set(key, !1);
        });
    },
    setBoolByIds: function(trueKey, idKey, ids, bool) {
        ids = ids.split("&").map(function(id) {
            return +id;
        }), ids.forEach(function(id) {
            var where_obj = {};
            where_obj[idKey] = id, this.where(where_obj).length && this.where(where_obj)[0].set(trueKey, bool);
        }, this);
    },
    addTagsFromId: function(objectList) {
        return objectList.forEach(function(item) {
            item.subject_tags = $.extend(!0, [], item.subject_tags.map(function(d) {
                return pageData.org.subject_tags.filter(function(f) {
                    return f.id == d;
                })[0];
            })), item.events.forEach(function(ev) {
                ev.impact_tags = $.extend(!0, [], ev.impact_tags.map(function(d) {
                    return pageData.org.impact_tags.filter(function(f) {
                        return f.id == d;
                    })[0];
                }));
            });
        }), objectList;
    },
    meta: function(prop, value) {
        return void 0 === value ? this[prop] : void (this[prop] = value);
    }
}, helpers.templates = {
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
        return src = src.replace(/-/g, " "), helpers.templates.toTitleCase(src);
    },
    toUserTimezone: function(utcDate) {
        var utc_date = new Date(utcDate), user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.org.timezone)));
        return user_timezone_date;
    },
    date: function(utcDate) {
        var user_timezone_date = helpers.templates.toUserTimezone(utcDate), full_date_string = user_timezone_date.toDateString(), month_day_year_arr = full_date_string.split(" ").slice(1, 4), commafy = month_day_year_arr[0] + " " + month_day_year_arr[1] + ", " + month_day_year_arr[2];
        return commafy.replace(" 0", " ");
    },
    conciseDate: function(utcDate) {
        var user_timezone_date = helpers.templates.toUserTimezone(utcDate), full_date_string = user_timezone_date.toISOString(), month_day_year_arr = full_date_string.split("T")[0];
        return parts_arr = month_day_year_arr.split("-"), parts_arr[1] + "-" + parts_arr[2] + "-" + parts_arr[0].substr(2, 2);
    },
    formatEnabled: function(bool) {
        return bool ? "Recipe is active" : "Recipe not active";
    },
    formatDefaultEventEnabled: function(bool) {
        return bool ? "Enabled" : "Disabled";
    },
    getAssociatedItems: function(id, itemKey, itemsObj) {
        return itemsObj = pageData[itemsObj], _.filter(itemsObj, function(obj) {
            return obj[itemKey] == id;
        });
    },
    bakeEventCreationForm: function(recipe_id, text, link, timestamp) {
        var markup = "", schema = {}, schema_with_selects = {};
        $.extend(!0, schema, pageData.eventSchema);
        var settings = {
            timestamp: timestamp,
            text: text,
            link: link
        };
        return $.extend(!0, settings, _.filter(pageData.accountRecipes, function(accountRecipe) {
            return accountRecipe.id === recipe_id;
        })[0].default_event), schema_with_selects = this.combineFormSchemaWithVals(schema, settings), 
        markup = this.bakeForm(schema_with_selects);
    },
    bakeRecipeUpdateForm: function(id, source, settings, recipeName, schemaOrDefaultEvent) {
        var markup = "", schema = {}, schema_with_selects = {};
        return $.extend(!0, schema, _.filter(pageData.recipeSchemas, function(recipeSchema) {
            return recipeSchema.source == source;
        })[0][schemaOrDefaultEvent]), schema_with_selects = this.combineFormSchemaWithVals(schema, settings, recipeName), 
        markup = this.bakeForm(schema_with_selects);
    },
    combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName) {
        return schema_obj.name && (schema_obj.name.selected = recipeName), _.each(settings_obj, function(setting, fieldName) {
            var selected_array = schema_obj[fieldName].selected || [];
            schema_obj[fieldName].selected = "impact_tags" != fieldName && "asignee" != fieldName ? setting : selected_array.concat(setting);
        }), schema_obj;
    },
    formJsonToMarkup: {
        text: function(fieldName, fieldNamePretty, data) {
            var markup, value = this.escapeQuotes(data.selected) || "";
            return markup = '<div class="form-row">', markup += '<div class="form-row-label-container">', 
            markup += '<label for="' + fieldName + '"> ' + fieldNamePretty + "</label> ", markup += "</div>", 
            markup += '<div class="form-row-input-container">', data.help && data.help.link && (markup += '<div class="help-row"><a href="' + data.help.link + '" target="_blank">How do I search?</a></div>'), 
            markup += '<input type="text" name="' + fieldName + '" id="' + fieldName + '" value="' + value + '" placeholder="' + (data.help && data.help.hint ? this.escapeQuotes(data.help.hint) : "") + '"/>', 
            markup += "</div>", markup += "</div>";
        },
        select: function(fieldName, fieldNamePretty, data) {
            var markup, that = this;
            return markup = '<div class="form-row">', markup += '<div class="form-row-label-container">', 
            markup += "<label>" + fieldNamePretty + "</label> ", markup += "</div>", markup += '<div class="form-row-input-container">', 
            markup += '<select id="' + fieldName + '" name="' + fieldName + '">', _.each(data.options, function(option) {
                var selected = "";
                data.selected == option && (selected = "selected"), markup += '<option value="' + option + '" ' + selected + ">" + that.prettyName(option) + "</option>";
            }), markup += "</select>", markup += "</div>", markup += "</div>";
        },
        checkbox: function(fieldName, fieldNamePretty, data) {
            var markup, banished_keys = [ "Requires approval" ];
            return _.contains(banished_keys, fieldNamePretty) ? "" : (markup = '<div class="form-row">', 
            markup += '<div class="form-row-label-container form-row-label-top">', markup += "<label>" + fieldNamePretty + "</label> ", 
            markup += "</div>", markup += '<div class="form-row-input-container">', _.each(data.options, function(checkboxItem) {
                var checkboxId = _.uniqueId("NewsLynx|checkbox|" + fieldName + "|" + checkboxItem + "|");
                markup += '<div class="form-checkbox-group">';
                var checked;
                _.contains(data.selected, checkboxItem) && (checked = "checked"), markup += '<input id="' + checkboxId + '" name="' + fieldName + "|" + checkboxItem + '" type="checkbox" ' + checked + "/>", 
                markup += '<label for="' + checkboxId + '">' + checkboxItem + "</label>", markup += "</div>";
            }), markup += "</div>", markup += "</div>");
        }
    },
    bakeForm: function(schema) {
        var form = "";
        return _.each(schema, function(fieldData, fieldName) {
            var field_name_pretty = this.prettyName(fieldName);
            form += this.formJsonToMarkup[fieldData.type].call(this, fieldName, field_name_pretty, fieldData);
        }, this), form;
    },
    prettyName: function(name) {
        var name_changes = {
            q: "search_query"
        };
        return name_changes[name] && (name = name_changes[name]), name = name.replace(/_/g, " "), 
        name.charAt(0).toUpperCase() + name.slice(1);
    },
    escapeQuotes: function(term) {
        return term ? "string" != typeof term ? term : term.replace(/"/g, "&quot;") : !1;
    },
    displaySearchParams: function(source, settings) {
        return "google-alert" == source ? settings.search_query : "twitter-search" == source ? settings.q : "twitter-list" == source ? settings.owner_screen_name + "," + settings.slug : "twitter-user" == source ? settings.screen_name : "reddit-search" == source ? settings.search_query : "facebook-page" == source ? settings.page_id : void console.error("You need to add a search_query key `templates.js` to display this type of recipe.");
    },
    getRecipeFromId: function(id) {
        return pageData.accountRecipes.filter(function(recipe) {
            return +recipe.id === id;
        })[0];
    }
}, models.app = {
    Model: Backbone.Model.extend({})
}, models.detail_item = {
    Model: Backbone.Model.extend({})
}, models.drawer_item_all = {
    Model: Backbone.Model.extend({
        defaults: {
            viewing: !1
        }
    })
}, models.drawer_list_item = {
    Model: Backbone.Model.extend({
        defaults: {
            viewing: !1
        },
        toggle: helpers.modelsAndCollections.toggle
    })
}, models.event = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/events"
    })
}, models.org = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/organization/settings",
        idAttribute: "uqbar"
    })
}, models.recipe_creator = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/recipes"
    })
}, models.river_item = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/alerts",
        defaults: {
            destroy: !1,
            mhk: !0
        }
    })
}, models.row_item = {
    Model: Backbone.Model.extend({})
}, models.tags = {
    Model: Backbone.Model.extend({
        defaults: {
            active: !1
        },
        toggle: helpers.modelsAndCollections.toggle
    })
}, collections.all_detail_items = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.detail_item.Model,
        getTrue: helpers.modelsAndCollections.getTrue,
        zeroOut: helpers.modelsAndCollections.zeroOut,
        meta: helpers.modelsAndCollections.meta,
        filterAlerts: function(idKey, searchVal) {
            var where_obj = {};
            return where_obj[idKey] = searchVal, this.where(where_obj);
        }
    })
}, collections.detail_items = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.detail_item.Model,
        getTrue: helpers.modelsAndCollections.getTrue,
        zeroOut: helpers.modelsAndCollections.zeroOut,
        meta: helpers.modelsAndCollections.meta,
        model: models.river_item.Model
    })
}, collections.drawer_items = {
    instance: null,
    instance_static: null,
    Collection: Backbone.Collection.extend({
        model: models.drawer_list_item.Model,
        getTrue: helpers.modelsAndCollections.getTrue,
        zeroOut: helpers.modelsAndCollections.zeroOut,
        setBoolByIds: helpers.modelsAndCollections.setBoolByIds
    })
}, collections.impact_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.tags.Model,
        getTrue: helpers.modelsAndCollections.getTrue
    })
}, collections.row_items = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.detail_item.Model,
        getTrue: helpers.modelsAndCollections.getTrue,
        zeroOut: helpers.modelsAndCollections.zeroOut
    })
}, collections.subject_tags = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.tags.Model,
        getTrue: helpers.modelsAndCollections.getTrue
    })
}, app.ApprovalRiver = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click .scroll-to": "scrollTo"
    },
    initialize: function() {
        this.$drawer = $("#drawer"), this.$content = $("#content"), this.$listContainer = $("#river-items-container"), 
        this.$recipes = $("#recipes"), this.$recipeCreators = $("#recipe-creators"), this.$divisionSwitcher = $(".division-switcher"), 
        this.$viewAll = $(".view-all").parent(), this.isotopeCntnr = "#river-items-container", 
        this.isotopeChild = ".article-detail-wrapper", this.drawerData = pageData.accountRecipes, 
        this["my-recipes"] = {
            detailData: pageData.riverItems,
            Model: models.river_item.Model
        }, this.listId = "id", this.detailId = "recipe_id", this.listenTo(collections.drawer_items.instance, "change:viewing", app.helpers.itemDetail.go), 
        this.listenTo(models.drawer_item_all.instance, "change:viewing", this.river.loadAllAlerts), 
        this.listenTo(this.model, "change:view-all", this.updateViewAll), this.listenTo(collections.detail_items.instance, "add", this.river.bake), 
        this.listenTo(collections.detail_items.instance, "remove", this.river.destroy), 
        this.bake();
    },
    updateViewAll: function() {
        var active_drawer_items, viewing_all = this.model.get("view-all");
        viewing_all ? (models.drawer_item_all.instance.set("viewing", !0), active_drawer_items = collections.drawer_items.instance.getTrue("viewing"), 
        active_drawer_items.length && collections.drawer_items.instance.getTrue("viewing")[0].set("viewing", !1)) : models.drawer_item_all.instance.set("viewing", !1);
    },
    bake: function() {
        collections.drawer_items.instance.each(function(recipe) {
            var recipe_view = new views.DrawerListItem({
                model: recipe
            });
            this.$recipes.append(recipe_view.render().el), this.pending_total += 5;
        }, this), collections.drawer_items.instance_static.each(function(recipeCreator) {
            var recipe_creator_view = new views.DrawerListItemStatic({
                model: recipeCreator
            });
            this.$recipeCreators.append(recipe_creator_view.render().el);
        }, this), collections.drawer_items.instance_static.each(function(recipeCreator) {
            var recipe_creator_form_view = new views.RecipeForm({
                model: recipeCreator
            });
            this.$content.append(recipe_creator_form_view.render().el);
        }, this), new views.DivisionSwitcher({
            model: models.section_mode,
            el: this.$divisionSwitcher
        }), new views.LoadAllDrawerItems({
            model: models.drawer_item_all.instance,
            el: this.$viewAll
        }), app.helpers.isotope.initCntnr.call(this);
        return this;
    },
    scrollTo: function(e) {
        var dest = $(e.currentTarget).attr("data-destination");
        this.$content.animate({
            scrollTop: this.$content.scrollTop() + $("#" + dest + "-recipe").position().top - parseFloat(this.$content.css("padding-top"))
        }, 200);
    },
    divisionSwitcher: {
        updateHash: function(entering_mode) {
            var exiting_hash = window.location.hash, exiting_mode = routing.helpers.getMode(exiting_hash), exiting_ids = routing.helpers.getArticleIds(exiting_hash), previous_ids = models.section_mode.get("previous-ids") || "", entering_hash = entering_mode;
            "my-recipes" == exiting_mode && exiting_ids ? models.section_mode.set("previous-ids", exiting_ids) : "create-new" == exiting_mode && previous_ids && (entering_hash += "/" + previous_ids), 
            routing.router.navigate(entering_hash, {
                trigger: !0
            });
        }
    },
    river: {
        bake: function(detailModel) {
            {
                var item_view, item_el;
                models.section_mode.get("mode"), detailModel.get("id");
            }
            return detailModel.set("destroy", !1), detailModel.urlRoot = "api/alerts", item_view = new views.RiverItem({
                model: detailModel
            }), item_el = item_view.render().el, this.$listContainer.append(item_el), app.helpers.isotope.addItem.call(app.instance, item_el), 
            this;
        },
        destroy: function(detailModel) {
            var viewing_all = app.instance.model.get("viewing_all");
            viewing_all || detailModel.set("destroy", "delete");
        },
        loadAllAlerts: function(loadAllModel) {
            var section_mode, load_all = loadAllModel.get("viewing");
            load_all && (console.log("load all"), section_mode = models.section_mode.get("mode"), 
            collections.detail_items.instance.set(collections.all_detail_items.instance.models), 
            app.helpers.isotope.relayout(), collections.detail_items.instance.each(function(m) {
                console.log(m.url), console.log(m.urlRoot), console.log(m);
            }));
        },
        loadMoreAlerts: function() {}
    }
}), app.Articles = Backbone.View.extend({
    el: "#main-wrapper",
    initialize: function() {
        this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list'), 
        this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list'), 
        this.$articleList = $("#article-list"), this.$drawer = $("#drawer"), this.$content = $("#content"), 
        this.$divisionSwitcher = $(".division-switcher"), this.isotopeCntnr = ".rows", this.isotopeChild = ".article-detail-row-wrapper", 
        this.drawerData = pageData.articleSummaries, this.single = {
            detailData: helpers.modelsAndCollections.addTagsFromId(pageData.articleDetails),
            Model: models.detail_item.Model
        }, this.compare = {
            detailData: pageData.articleSummaries,
            Model: models.row_item.Model
        }, console.log(this.single.detailData), this.listId = "id", this.detailId = "article_id", 
        this.listenTo(models.section_mode, "change:mode", this.divisionSwitcher.updateCollection), 
        this.listenTo(models.section_mode, "change:mode", this.articleDetail.prepTheDom), 
        this.listenTo(collections.subject_tags.instance, "change:active", this.drawer.filter), 
        this.listenTo(collections.impact_tags.instance, "change:active", this.drawer.filter), 
        this.listenTo(collections.drawer_items.instance, "change:viewing", app.helpers.itemDetail.go), 
        this.listenTo(collections.detail_items.instance, "add", this.articleDetail.bake), 
        this.listenTo(collections.detail_items.instance, "remove", this.articleDetail.destroy), 
        this.bake();
    },
    bake: function() {
        return collections.subject_tags.instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$subjectTagList.append(tag_view.render().el);
        }, this), collections.impact_tags.instance.each(function(tag) {
            var tag_view = new views.Tag({
                model: tag
            });
            this.$impactTagList.append(tag_view.render().el);
        }, this), collections.drawer_items.instance.each(function(article) {
            var article_view = new views.DrawerListItem({
                model: article
            });
            this.$articleList.append(article_view.render().el);
        }, this), new views.DivisionSwitcher({
            model: models.section_mode,
            el: this.$divisionSwitcher
        }), this;
    },
    articleDetail: {
        prepTheDom: function(sectionModel) {
            if ("compare" == sectionModel.get("mode")) {
                var article_grid = new views.ArticleDetailGrid();
                this.$content.html(article_grid.render().el);
            }
            this.$listContainer = $("#compare-grid .rows");
        },
        bake: function(detailModel) {
            var item_view, item_el, mode = models.section_mode.get("mode");
            return "single" == mode ? (item_view = new views.ArticleDetail({
                model: detailModel
            }), item_el = item_view.render().el, this.$content.html(item_el), item_view.bakeInteractiveBits()) : (app.helpers.isotope.initCntnr.call(this), 
            item_view = new views.ArticleDetailRow({
                model: detailModel
            }), item_el = item_view.render().el, this.$listContainer.append(item_el), item_view.update(app.helpers.isotope.addItem)), 
            this;
        },
        destroy: function(detailModel) {
            detailModel.set("destroy", !0);
        }
    },
    divisionSwitcher: {
        updateCollection: function() {
            return collections.detail_items.instance.remove(collections.detail_items.instance.models), 
            this;
        },
        updateHash: function(entering_mode, new_id) {
            app.helpers.isotope.clearCntnr.call(app.instance);
            var hash_arr = current_ids = [], new_ids = new_id || models.section_mode.get("previous-ids") || "";
            return routing.helpers.getArticleIds(window.location.hash) && (hash_arr = window.location.hash.split("/"), 
            current_ids = hash_arr.slice(1, hash_arr.length)[0].split("&"), new_ids = new_ids || current_ids, 
            "single" == entering_mode && current_ids.length > 1 && !new_id && (new_ids = current_ids[0]), 
            _.isArray(new_ids) && (new_ids = new_ids.join("&"))), routing.router.navigate(entering_mode + "/" + new_ids, {
                trigger: !0
            }), _.isArray(current_ids) && 0 === current_ids.length && (current_ids = ""), models.section_mode.set("previous-ids", current_ids), 
            this;
        }
    },
    drawer: {
        filter: function() {
            return this;
        },
        bake: function() {}
    }
}), app.Settings = Backbone.View.extend({
    el: "#main-wrapper",
    events: {
        "click button.add": "addItem",
        "click .destroy": "removeItem",
        "click #save": "saveDataToServer",
        sync: "saved"
    },
    initialize: function() {
        this.$drawer = $("#drawer"), this.$content = $("#content"), this.instantiate();
    },
    saved: function() {
        console.log("saved in view");
    },
    instantiate: function() {
        var markup = templates.settingsFactory(this.model.toJSON());
        this.$content.html(markup), this.initColorPicker(this.$content);
    },
    initColorPicker: function($el) {
        var that = this;
        $el.find(".color-picker").each(function() {
            var group = $(this).attr("data-group");
            $(this).spectrum({
                preferredFormat: "hex",
                showInput: !0,
                showPalette: !0,
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
        var placeholders, $newItem, $inputsContainer = $(e.currentTarget).siblings(".inputs-container"), new_item = {};
        new_item.flag = $inputsContainer.attr("data-flag"), new_item.group = $inputsContainer.attr("data-group"), 
        new_item.keys = [], $inputsContainer.find(".input-item").each(function() {
            new_item.keys.push($(this).attr("data-key"));
        }), "double" == $inputsContainer.attr("data-layout") ? (placeholders = JSON.parse($inputsContainer.attr("data-placeholder")), 
        new_item.placeholder0 = placeholders[0], new_item.placeholder1 = placeholders[1], 
        $inputsContainer.append(templates.multiInputDoubleFactory(new_item))) : "impact-tags" == $inputsContainer.attr("data-layout") ? (new_item.placeholder = $inputsContainer.attr("data-placeholder"), 
        $newItem = $(templates.impactTagInputFactory(new_item)), $newItem.appendTo($inputsContainer), 
        this.initColorPicker($newItem)) : (new_item.placeholder = $inputsContainer.attr("data-placeholder"), 
        $newItem = $(templates.multiInputFactory(new_item)), $newItem.appendTo($inputsContainer), 
        "color" == new_item.flag && this.initColorPicker($newItem));
    },
    removeItem: function(e) {
        var $thisInput = $(e.currentTarget).parents("li.input.multi");
        $thisInput.remove();
    },
    saveDataToServer: function() {
        var settings = this.getSettingsData(), valid = this.validateSettings(settings);
        valid && (console.log("Posting settings!"), this.model.save(settings, {
            error: function(model, response) {
                console.log("error in model save", response);
            },
            success: function(model, response) {
                console.log("saved in model save", response);
            }
        }));
    },
    getSettingsData: function() {
        var settings = {}, $inputContainers = this.$el.find(".inputs-container");
        return $inputContainers.each(function() {
            var input_val, $this = $(this), key = $this.attr("data-key"), $inputs = $this.find(".input");
            $inputs.hasClass("multi") ? $inputs.each(function() {
                var input_obj = {}, val_collection = [];
                $(this).find(".input-item").each(function() {
                    var val, $this = $(this), input_key = $this.attr("data-key"), type = $this.attr("type");
                    if (val = "radio" == type || "checkbox" == type ? $this.prop("checked") : $this.val(), 
                    "string" == typeof val && (val = val.trim()), input_key) {
                        if (input_obj[input_key] = val, $this.attr("data-id")) {
                            var id = $this.attr("data-id");
                            "false" === id && (id = null), input_obj.id = parseFloat(id);
                        }
                    } else input_obj = val;
                    val_collection.push(val);
                }), _.some(val_collection, function(d) {
                    return _.isEmpty(d) && !_.isBoolean(d);
                }) || (settings[key] || (settings[key] = []), settings[key].push(input_obj));
            }) : (input_val = $inputs.find(".input-item").val().trim(), input_val && (settings[key] = input_val));
        }), settings;
    },
    reportError: function(msg) {
        return alert(msg), !1;
    },
    validateSettings: function(settings) {
        if (settings.password) {
            if (!_.isEqual(settings.password[0], settings.password[1])) return this.reportError("Passwords do not match"), 
            !1;
            settings.password = settings.password[0];
        }
        return !0;
    }
}), app.helpers = {
    drawer: {
        setModeOnly: function(mode) {
            models.section_mode.set("mode", mode);
        },
        add: function(mode, ids) {
            app.helpers.drawer.setModeOnly(mode), ids && collections.drawer_items.instance.setBoolByIds("viewing", this.listId, ids, !0);
        },
        remove: function(mode, ids) {
            app.helpers.drawer.setModeOnly(mode), ids && collections.drawer_items.instance.setBoolByIds("viewing", this.listId, ids, !1);
        },
        determineBehavior: function() {
            var behavior = "radio";
            return "compare" == models.section_mode.get("mode") && (behavior = "checkbox"), 
            behavior;
        },
        getAllIds: function() {
            var ids = [];
            return _.each(this.drawerData, function(drawerDatum) {
                ids.push(drawerDatum[this.listId]);
            }, this), ids;
        },
        enableAll: function() {
            app.instance.model.set("view-all", !0), models.drawer_item_all.instance.set("viewing", !0);
        }
    },
    itemDetail: {
        go: function(listItemModel) {
            var destination, action, is_new = listItemModel.get("viewing"), id = listItemModel.get(this.listId), pending = listItemModel.get("pending"), min_timestamp = collections.all_detail_items.instance.meta("timestamp");
            return is_new && (action = "add", destination = app.helpers.itemDetail.add, app.helpers.itemDetail.fetch.call(this, id, action, destination, pending, min_timestamp)), 
            this;
        },
        fetch: function(itemId, action, cb, pending, minTimestamp) {
            var page_limit = 5, mode = models.section_mode.get("mode"), loaded_matches = collections.all_detail_items.instance.filterAlerts(app.instance.detailId, itemId);
            if (loaded_matches.length && "my-recipes" != mode || "my-recipes" == mode && (loaded_matches.length >= page_limit || loaded_matches.length == pending)) cb.call(this, loaded_matches), 
            app.helpers.isotope.relayout(); else {
                var new_article_detail = new this[mode].Model({
                    id: itemId
                }), options = {};
                minTimestamp && (options = {
                    data: {
                        before: minTimestamp
                    },
                    processData: !0,
                    success: function(model, response) {
                        console.log("fetched", response.results.length, "new models"), collections.all_detail_items.instance.add(response.results);
                        var matches_loaded_so_far = loaded_matches.concat(response.results);
                        cb(matches_loaded_so_far);
                    },
                    error: function() {
                        console.log("Error fetching " + itemId);
                    }
                }), new_article_detail.fetch(options);
            }
        },
        add: function(itemData) {
            collections.detail_items.instance.set(itemData), app.instance.$isotopeCntnr.isotope("layout");
        }
    },
    isotope: {
        initCntnr: function() {
            this.$isotopeCntnr || (this.$isotopeCntnr = this.$listContainer, this.$isotopeCntnr.isotope({
                itemSelector: this.isotopeChild,
                masonry: {
                    columnWidth: 400
                },
                getSortData: {
                    timestamp: "[data-timestamp] parseFloat",
                    title: "[data-title]",
                    date: "[data-date]",
                    twitter: "[data-twitter] parseFloat",
                    facebook: "[data-facebook] parseFloat",
                    pageviews: "[data-pageviews] parseFloat",
                    "time-on-page": "[data-time-on-page] parseFloat",
                    internal: "[data-internal] parseFloat",
                    external: "[data-external] parseFloat",
                    subject: "[data-subject] parseFloat",
                    impact: "[data-impact] parseFloat"
                }
            }));
        },
        clearCntnr: function() {
            this.$isotopeCntnr && (this.$isotopeCntnr = null);
        },
        addItem: function($el) {
            app.helpers.isotope.initCntnr.call(this), this.$isotopeCntnr.isotope("appended", $el);
        },
        relayout: function() {
            console.log("here"), app.instance.$isotopeCntnr.isotope({
                sortBy: "timestamp",
                sortAscending: !1
            }), app.instance.$isotopeCntnr.isotope("layout");
        }
    }
}, views.ArticleDetail = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper",
    events: {},
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy), this.chartSelector = "#ST-chart", 
        this.formatDate = d3.time.format("%Y-%m-%d %X"), this.legend = {
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
        }, this.eventsData = this.model.toJSON().events, this.timeseriesData = this.model.toJSON().timeseries_stats;
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
        return this.$el.html(article_detail_markup), this;
    },
    bakeInteractiveBits: function() {
        this.bakeChart(), this.bakeEventGallery;
    },
    bakeChart: function() {
        d3.select(this.chartSelector).datum(this.timeseriesData).call(this.spottedTail);
    },
    bakeEventGallery: function() {},
    filterEventsByDateRange: function(dateRange) {
        console.log(dateRange);
    },
    destroy: function() {
        this.model.get("destroy") && this.remove();
    }
}), views.ArticleDetailGrid = Backbone.View.extend({
    tagName: "div",
    className: "compare-grid-container",
    events: {
        "click .header-el": "sortColumn"
    },
    initialize: function() {
        this.render(), this.sortAscending = !0;
    },
    render: function() {
        var grid_markup = templates.articleGridContainerMarkup;
        return this.$el.html(grid_markup), this;
    },
    sortColumn: function(e) {
        var $this = $(e.currentTarget);
        $(".header-el").removeClass("active"), $this.addClass("active");
        var metric = $this.attr("data-metric");
        this.sortAscending = !this.sortAscending, app.instance.$isotopeCntnr.isotope({
            sortBy: metric,
            sortAscending: this.sortAscending
        });
    }
}), views.ArticleDetailRow = Backbone.View.extend({
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
        var $el = this.$el, model_json = this.model.toJSON(), article_detail_markup = templates.articleDetailRowFactory(_.extend(model_json, helpers.templates));
        return this.$el.html(article_detail_markup), this.$el.attr("data-title", model_json.title).attr("data-date", model_json.timestamp), 
        this.data = this.transformData(this.model.toJSON()), _.each(this.data.quant_metrics, function(bullet) {
            $el.attr("data-" + bullet.metric, bullet.count);
        }), $el.attr("data-qual-subject-tags", this.data.qual_metrics.subject_tags.length), 
        _.each(this.data.qual_metrics.impact_tags, function(category) {
            $el.attr("data-qual-" + category.key, category.values.count);
        }), this._el = d3.select(this.el).select(".article-detail-row-container").selectAll(".cell"), 
        this;
    },
    transformData: function(modelData) {
        var tag_columns = !1;
        return modelData.qual_metrics = d3.nest().key(function(d) {
            return d.metric;
        }).rollup(function(list) {
            var tags = $.extend(!0, [], list.map(function(d) {
                return pageData.org[d.metric].filter(function(f) {
                    return f.id == d.id;
                })[0];
            }));
            if ("subject_tags" == list[0].metric) {
                var i, j, chunk = 4;
                for (tag_columns = [], i = 0, j = tags.length; j > i; i += chunk) tag_columns.push(tags.slice(i, i + chunk));
                tags = tag_columns;
            }
            return tags;
        }).map(modelData.qual_metrics), modelData.qual_metrics.impact_tags = d3.nest().key(function(d) {
            return d.category;
        }).rollup(function(list) {
            return {
                count: list.length,
                values: list
            };
        }).entries(modelData.qual_metrics.impact_tags), modelData;
    },
    update: function(cb) {
        var row = this._el.data([ this.data ]).enter();
        row.append("div").classed("cell", !0).classed("title", !0).classed("wide", !0).attr("data-article_id", function(d) {
            return d.article_id;
        }).html(function(d) {
            return d.title;
        }), row.append("div").classed("cell", !0).classed("date", !0).classed("single", !0).attr("data-date", function(d) {
            return d.timestamp;
        }).html(function(d) {
            return helpers.templates.conciseDate(d.timestamp);
        });
        var bullet_container = this._el.data(this.data.quant_metrics).enter().append("div").classed("cell", !0).classed("multi", !0).classed("gfx", !0).append("div").classed("bullet-container", !0), that = this;
        bullet_container.append("div").classed("bullet", !0).style("width", function(d) {
            return that.helpers.calcSize(d, "count");
        });
        var subject_bar_container = row.append("div").classed("cell", !0).classed("bars", !0).classed("gfx", !0).append("div").classed("bar-container", !0).attr("data-group", "subject-tags");
        subject_bar_container.selectAll(".bar-column").data(this.data.qual_metrics.subject_tags).enter().append("div").classed("bar-column", !0).selectAll(".bar").data(function(d) {
            return d;
        }).enter().append("div").classed("bar", !0).style("background-color", function(d) {
            return d.color;
        });
        var impact_bar_container = row.append("div").classed("cell", !0).classed("bars", !0).classed("gfx", !0).append("div").classed("bar-container", !0).attr("data-group", "impact-tags"), impact_bar_column = impact_bar_container.selectAll(".bar-column").data(this.data.qual_metrics.impact_tags).enter().append("div").classed("bar-column", !0);
        impact_bar_column.selectAll(".bar").data(function(d) {
            return d.values.values;
        }).enter().append("div").classed("bar", !0).style("background-color", function(d) {
            return d.color;
        }), cb.call(app.instance, this.$el);
    },
    updateBulletMarker: function() {},
    goToDetail: function(e) {
        var article_id = $(e.currentTarget).attr("data-article_id");
        app.instance.divisionSwitcher.updateHash("single", article_id);
    },
    close: function() {
        var behavior = app.helpers.drawer.determineBehavior();
        routing.router.set[behavior](this.model.get(app.instance.detailId));
    },
    destroy: function() {
        this.model.get("destroy") && (app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove());
    },
    helpers: {
        calcSize: function(d, value) {
            var val = d[value], max = pageData.org.metric_maxes.filter(function(f) {
                return f.metric = d.metric;
            })[0].max, scale = d3.scale.linear().domain([ 0, max ]).range([ 1, 100 ]);
            return scale(val).toString() + "%";
        }
    }
}), views.DivisionSwitcher = Backbone.View.extend({
    events: {
        "click li": "setHash"
    },
    initialize: function() {
        this.listenTo(this.model, "change:mode", this.updateActiveState), this.updateActiveState();
    },
    setHash: function(e) {
        var $el = $(e.currentTarget);
        if (!$el.hasClass("active")) {
            var mode = $el.attr("data-mode");
            app.instance.divisionSwitcher.updateHash(mode);
        }
        return this;
    },
    updateActiveState: function() {
        var mode = this.model.get("mode");
        return $("#drawer").attr("data-mode", mode), $("#content").attr("data-mode", mode), 
        this.$el.find("li").removeClass("active"), this.$el.find('li[data-mode="' + mode + '"]').addClass("active"), 
        $('.mode-content[data-mode="' + mode + '"]').show(), $('.mode-content[data-mode!="' + mode + '"]').hide(), 
        this;
    }
}), views.DrawerListItem = Backbone.View.extend({
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
        this.listenTo(this.model, "change:viewing", this.setActiveCssState), this.listenTo(this.model, "change:enabled", this.renderEnabled), 
        this.listenTo(this.model, "change:set_default_event", this.showHideDefaults), this.modalOpen = !1, 
        this.pending = this.model.get("pending");
    },
    render: function() {
        var drawer_list_item_markup = templates.drawerListItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(drawer_list_item_markup), this.$form = this.$el.find("form"), 
        this.$defaultEvents = this.$el.find(".default-event-container"), this.$defautEventsBtn = this.$el.find(".toggle-default-event"), 
        this.$submitMsg = this.$el.find(".submit-msg"), this;
    },
    renderEnabled: function() {
        var enabled = this.model.get("enabled");
        this.$el.find(".enable-switch").attr("data-enabled", enabled).html(helpers.templates.formatEnabled(enabled));
    },
    toggleModal: function(e) {
        this.killEvent(e), this.modalOpen = !this.modalOpen, views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        var that = this;
        e.preventDefault();
        var recipe_data = this.remodelRecipeJson();
        this.model.save(recipe_data, {
            error: function(model, response) {
                console.log("error in recipe update", response), alert("Your update did not succeed. Please try again. Check the console for errors.");
            },
            success: function(model, response) {
                console.log("updated recipe", response), that.toggleModal(e);
            }
        });
    },
    destroyModel: function(e) {
        var that = this;
        this.model.destroy({
            error: function(model, response) {
                console.log("error in model destroy", response), alert("Your destroy did not work. Please try again. Check the console for errors.");
            },
            success: function(model, response) {
                console.log("recipe destroyed", response), that.toggleModal(e), that.$el.remove();
            }
        });
    },
    remodelRecipeJson: function() {
        var serializedArray = this.$form.serializeArray(), recipe_info = {
            source: this.model.get("source"),
            type: this.model.get("type"),
            set_default_event: this.model.get("set_default_event")
        }, model_json = views.helpers.remodelRecipeJson.update(recipe_info, serializedArray);
        return model_json;
    },
    toggleEnabled: function(e) {
        this.killEvent(e), this.model.set("enabled", !this.model.get("enabled"));
    },
    killEvent: function(e) {
        e.stopPropagation();
    },
    setActiveCssState: function(model) {
        var ids = routing.helpers.getArticleIds(window.location.hash);
        return ids ? (this.$el.find(".drawer-list-outer").toggleClass("active", model.get("viewing")), 
        this.$el.find(".inputs-container input").prop("checked", model.get("viewing"))) : (this.$el.find(".drawer-list-outer").toggleClass("active", !1), 
        this.$el.find(".inputs-container input").prop("checked", !1)), this;
    },
    toggleDefaults: function() {
        this.model.set("set_default_event", !this.model.get("set_default_event"));
    },
    showHideDefaults: function() {
        var open = this.model.get("set_default_event"), slide_duration = 350;
        open ? (this.$defautEventsBtn.html("Enabled").attr("data-status", "true"), this.$defaultEvents.slideDown(slide_duration, "easeOutQuint")) : (this.$defautEventsBtn.html("Disabled").attr("data-status", "false"), 
        this.$defaultEvents.slideUp(slide_duration, "easeOutQuint"));
    },
    setHash: function() {
        if (!this.modalOpen) {
            var behavior = app.helpers.drawer.determineBehavior();
            return routing.router.set[behavior](this.model.get(app.instance.listId)), this;
        }
    }
}), views.DrawerListItemStatic = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    initialize: function() {},
    render: function() {
        var drawer_list_item_markup = templates.drawerListItemStaticFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(drawer_list_item_markup), this;
    }
}), views.LoadAllDrawerItems = Backbone.View.extend({
    events: {
        "click .view-all:not(.active)": "setHash"
    },
    initialize: function() {
        this.listenTo(this.model, "change:viewing", this.setActiveCssState), this.$drawerListOuter = this.$el.find(".drawer-list-outer");
    },
    setHash: function() {
        return routing.router.navigate("my-recipes", {
            trigger: !0
        }), this;
    },
    setActiveCssState: function() {
        var active = this.model.get("viewing");
        this.$drawerListOuter.toggleClass("active", active), this.$drawerListOuter.find("input").prop("checked", active);
    }
}), views.RecipeForm = Backbone.View.extend({
    tagName: "div",
    className: "article-detail-wrapper mode-content",
    events: {
        "click .toggle-default-event": "toggleDefaults",
        "submit form": "save"
    },
    initialize: function() {
        this.listenTo(this.model, "change:destroy", this.destroy), this.listenTo(this.model, "change:set_default_event", this.showHideDefaults);
    },
    render: function() {
        var river_item_markup = templates.recipeFormFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(river_item_markup).attr("data-mode", "create-new"), this.$form = this.$el.find("form"), 
        this.$defaultEvents = this.$el.find(".default-event-container"), this.$defautEventsBtn = this.$el.find(".toggle-default-event"), 
        this.$submitMsg = this.$el.find(".submit-msg"), this.model.get("set_default_event") && (this.$defaultEvents.show(), 
        this.showHideDefaults()), this;
    },
    save: function(e) {
        e.preventDefault();
        var that = this, recipe_data = this.remodelRecipeJson(), new_recipe_creator_model = new models.recipe_creator.Model();
        new_recipe_creator_model.save(recipe_data, {
            error: function(model, response) {
                console.log("error in recipe creatin", response), that.flashResult("error");
            },
            success: function(model, response) {
                console.log("saved recipe", response), that.flashResult(null);
            }
        });
    },
    flashResult: function(error) {
        var animation_duration = 650;
        error ? (this.$el.css("background-color", "#FFD0D0").animate({
            "background-color": "#fff"
        }, animation_duration), this.printSubmitMsg("error", "Meow! There was an error!")) : (this.$el.css("background-color", "#D0F1D1").animate({
            "background-color": "#fff"
        }, animation_duration), this.render(), this.printSubmitMsg(null, "Recipe saved! Refresh your recipe list to see it."));
    },
    printSubmitMsg: function(error, msg) {
        var class_name = "success";
        error && (class_name = "fail"), this.$submitMsg.addClass(class_name).html(msg);
    },
    remodelRecipeJson: function() {
        var serializedArray = this.$form.serializeArray(), recipe_info = {
            source: this.model.get("source"),
            type: this.model.get("type"),
            set_default_event: this.model.get("set_default_event")
        }, model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray);
        return model_json;
    },
    toggleDefaults: function() {
        this.model.set("set_default_event", !this.model.get("set_default_event"));
    },
    showHideDefaults: function() {
        var open = this.model.get("set_default_event"), slide_duration = 350;
        open ? (this.$defautEventsBtn.html("Enabled").attr("data-status", "true"), this.$defaultEvents.slideDown(slide_duration, "easeOutQuint")) : (this.$defautEventsBtn.html("Disabled").attr("data-status", "false"), 
        this.$defaultEvents.slideUp(slide_duration, "easeOutQuint"));
    }
}), views.RiverItem = Backbone.View.extend({
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
        var model_json = this.model.toJSON(), river_item_markup = templates.riverItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(river_item_markup), this.$el.attr("data-timestamp", model_json.timestamp), 
        this.$form = this.$el.find("form"), this;
    },
    toggleModal: function(e) {
        views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        e.preventDefault();
        var that = this, alert_data = this.remodelFormJson(), new_event_model = new models.event.Model();
        console.log(alert_data), new_event_model.save(alert_data, {
            error: function(model, response) {
                console.log("error in recipe creatin", response);
            },
            success: function(model, response) {
                console.log("saved recipe", response), that.removeItem("save"), views.helpers.toggleModal(e);
            }
        });
    },
    remodelFormJson: function() {
        var serializedArray = this.$form.serializeArray(), model_json = views.helpers.remodelEventJson(this.model.id, serializedArray);
        return model_json;
    },
    makeInsignificant: function() {
        var that = this;
        this.model.destroy({
            success: function() {
                that.removeItem(!0);
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
        console.log("destroying model...", destroy_mode), destroy_mode === !0 && (app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove()), 
        "delete" == destroy_mode ? app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el) : this.remove() : "save" == destroy_mode && (app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove());
    }
}), views.Tag = Backbone.View.extend({
    tagName: "li",
    className: "tag-wrapper",
    events: {
        click: "toggle"
    },
    initialize: function() {
        this.listenTo(this.model, "change", this.styleLayout);
    },
    render: function() {
        var tag_markup = templates.tagFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(tag_markup), this.styleLayout(), this;
    },
    styleLayout: function() {
        this.$el.find(".tag-container").css("border-left-color", this.model.get("color"));
        var is_active = this.model.get("active"), color = is_active ? this.model.get("color") : "auto";
        return this.$el.toggleClass("active", is_active).find(".tag-container").css("background-color", color), 
        this;
    },
    toggle: function() {
        return this.model.toggle("active"), this;
    }
}), views.helpers = {
    toggleModal: function(e) {
        e.preventDefault(), e.stopPropagation();
        var $tray = $(e.currentTarget).parents(".modal-parent").find(".modal-outer");
        $tray.toggleClass("active", !$tray.hasClass("active")), $("body").attr("data-modal", $tray.hasClass("active")), 
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
            return (-1 != inputObj.name.indexOf("impact_tags|") || -1 != inputObj.name.indexOf("asignee|")) && (name_parts = inputObj.name.split("|"), 
            inputObj.name = name_parts[0], inputObj.value = name_parts[1]), inputObj;
        }), inputObj = d3.nest().key(function(d) {
            return d.name;
        }).rollup(function(list) {
            return 1 == list.length && "impact_tags" != list[0].name ? list[0].value : list.map(function(f) {
                return f.value;
            });
        }).map(inputArrays);
        return inputObj;
    },
    remodelRecipeJson: {
        create: function(formInfo, formInputsArray) {
            var input_obj = views.helpers.formSerialToObject(formInputsArray);
            return formInfo.name = input_obj.name, delete input_obj.name, formInfo.settings = input_obj, 
            formInfo.default_event = {}, formInfo.set_default_event && (formInfo.default_event = {
                title: input_obj.title,
                what_happened: input_obj.what_happened,
                significance: input_obj.significance,
                impact_tags: input_obj.impact_tags
            }), delete input_obj.title, delete input_obj.what_happened, delete input_obj.significance, 
            delete input_obj.impact_tags, formInfo;
        },
        update: function(formInfo, formInputsArray) {
            var input_obj = views.helpers.formSerialToObject(formInputsArray);
            return formInfo.name = input_obj.name, delete input_obj.name, delete input_obj.pending, 
            formInfo.settings = input_obj, formInfo.default_event = {}, formInfo.set_default_event && (formInfo.default_event = {
                title: input_obj.title,
                what_happened: input_obj.what_happened,
                significance: input_obj.significance,
                impact_tags: input_obj.impact_tags
            }), delete input_obj.title, delete input_obj.what_happened, delete input_obj.significance, 
            delete input_obj.impact_tags, formInfo;
        }
    },
    remodelEventJson: function(alert_id, formInputsArray) {
        var input_obj = views.helpers.formSerialToObject(formInputsArray);
        return input_obj.alert_id = alert_id, input_obj.timestamp = +input_obj.timestamp, 
        input_obj.impact_tags.length && (input_obj.impact_tags = input_obj.impact_tags.map(function(impactTag) {
            return pageData.org.impact_tags.filter(function(iT) {
                return iT.name === impactTag;
            })[0].id;
        })), input_obj;
    }
}, routing = {
    Router: Backbone.Router.extend({
        initialize: function(section) {
            this.history = [], this.listenTo(this, "route", function(name, args) {
                _.isUndefined(args[1]) || this.history.push({
                    name: name,
                    mode: args[0],
                    ids: args[1],
                    fragment: Backbone.history.fragment
                });
            }), routing.init[section].call(this), routing.init.common.call(this);
        },
        getAllAlerts: function(mode) {
            console.log("getting all alerts", mode);
        },
        stripTrailingSlash: function(mode) {
            app.helpers.drawer.setModeOnly(mode), routing.router.navigate(mode, {
                replace: !0
            });
        },
        readPage: function(mode, ids) {
            mode = mode.replace(/\//g, ""), console.log(ids), ids = routing.helpers.diffIds.call(this, mode, ids), 
            "my-recipes" == mode && app.instance.model.set("view-all", !1), ids.exiting && app.helpers.drawer.remove.call(app.instance, mode, ids.exiting), 
            ids.entering && app.helpers.drawer.add.call(app.instance, mode, ids.entering), ids.exiting || ids.exiting || app.helpers.drawer.setModeOnly(mode);
        },
        loadAllInSection: function(mode) {
            app.helpers.drawer.setModeOnly(mode), app.helpers.drawer.enableAll.call(app.instance);
        },
        set: {
            radio: function(id, trigger) {
                _.isUndefined(trigger) && (trigger = !0), routing.router.navigate(models.section_mode.get("mode") + "/" + id, {
                    trigger: trigger
                });
            },
            checkbox: function(articleId) {
                var hash = window.location.hash, hash_test = routing.helpers.getArticleIds(hash), exists = routing.helpers.exists(hash, articleId);
                exists ? hash = hash.replace(new RegExp("(&|)" + articleId, "g"), "").replace("/&", "/") : (hash_test ? hash += "&" : "/" != hash.substr(hash.length - 1, 1) && (hash += "/"), 
                hash += articleId), routing.router.navigate(hash, {
                    trigger: !0
                });
            }
        }
    }),
    helpers: {
        diffIds: function(mode, newIds) {
            var obj = {};
            if ("create-new" == mode) return !1;
            if (!this.history.length || !this.history[this.history.length - 1].ids) return this.history[this.history.length - 2] && "my-recipes" != mode ? {} : (obj.entering = newIds, 
            obj);
            var previous_ids = this.history[this.history.length - 1].ids.split("&"), newIds = newIds.split("&"), previous_ids_sorted = previous_ids.concat().sort(helpers.common.sortNumber), newIds_sorted = newIds.concat().sort(helpers.common.sortNumber), previous_mode = this.history[this.history.length - 1].mode;
            return "my-recipes" != mode || previous_ids || (previous_ids = app.helpers.drawer.getAllIds.call(app.instance)), 
            "compare" == mode ? newIds.length > previous_ids.length ? "compare" == previous_mode ? obj.entering = _.difference(newIds, previous_ids).join("&") : "single" == previous_mode && (obj.entering = newIds.join("&"), 
            obj.exiting = previous_ids.join("&")) : newIds.length < previous_ids.length ? obj.exiting = _.difference(previous_ids, newIds).join("&") : _.isEqual(newIds_sorted, previous_ids_sorted) ? obj.entering = newIds.join("&") : newIds.length == previous_ids.length && (obj.entering = newIds.join("&"), 
            obj.exiting = previous_ids.join("&")) : "single" == mode ? previous_ids.length > 1 ? (obj.entering = _.intersection(newIds, previous_ids).join("&"), 
            obj.exiting = _.difference(previous_ids, newIds).join("&")) : _.isEqual(newIds_sorted, previous_ids_sorted) ? obj.entering = newIds.join("&") : (obj.entering = newIds.join("&"), 
            obj.exiting = previous_ids.join("&")) : "my-recipes" == mode && (obj.entering = newIds.join("&"), 
            obj.exiting = previous_ids.join("&")), obj;
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
        }
    }
}, templates.init = {
    articles: function() {
        this.tagFactory = _.template($("#tag-templ").html()), this.drawerListItemFactory = _.template($("#article-summary-templ").html()), 
        this.articleDetailFactory = _.template($("#article-detail-templ").html()), this.articleGridContainerMarkup = $("#article-grid-container-templ").html(), 
        this.articleDetailRowFactory = _.template($("#article-detail-row-templ").html());
    },
    "approval-river": function() {
        this.drawerListItemFactory = _.template($("#recipe-templ").html()), this.drawerListItemStaticFactory = _.template($("#recipe-creator-templ").html()), 
        this.recipeFormFactory = _.template($("#recipe-form-templ").html()), this.riverItemFactory = _.template($("#river-item-templ").html());
    },
    settings: function() {
        this.settingsFactory = _.template($("#settings-templ").html()), this.impactTagInputFactory = _.template($("#impact-tag-input-templ").html()), 
        this.multiInputFactory = _.template($("#multi-input-templ").html()), this.multiInputDoubleFactory = _.template($("#multi-input-double-templ").html());
    }
}, models.init = {
    articles: function() {
        this.section_mode = new (Backbone.Model.extend({}))(), this.section_mode.set("mode", "single");
    },
    "approval-river": function() {
        this.section_mode = new (Backbone.Model.extend({}))(), this.section_mode.set("mode", "my-recipes"), 
        this.drawer_item_all.instance = new this.drawer_item_all.Model();
    },
    settings: function() {
        this.org.instance = new this.org.Model(pageData.org);
    }
}, collections.init = {
    articles: function() {
        this.subject_tags.instance = new this.subject_tags.Collection(pageData.org.subject_tags), 
        this.impact_tags.instance = new this.impact_tags.Collection(pageData.org.impact_tags), 
        this.drawer_items.instance = new this.drawer_items.Collection(pageData.articleSummaries), 
        this.row_items.instance = new this.row_items.Collection([]), this.detail_items.instance = new this.detail_items.Collection([]);
    },
    "approval-river": function() {
        this.drawer_items.instance = new this.drawer_items.Collection(pageData.accountRecipes), 
        this.drawer_items.instance.url = "/api/recipes", this.drawer_items.instance_static = new this.drawer_items.Collection(pageData.recipeSchemas), 
        this.detail_items.instance = new this.detail_items.Collection(), this.detail_items.instance.sort = "timestamp", 
        this.all_detail_items.instance = new this.all_detail_items.Collection(pageData.riverItems.results), 
        this.all_detail_items.instance.meta("timestamp", pageData.riverItems.min_timestamp);
    },
    settings: function() {}
}, app.init = {
    articles: function() {
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
}, routing.init = {
    go: function(section) {
        this.router = new this.Router(section), Backbone.history.start();
    },
    common: function() {
        this.route(":mode/:id", "readPage"), this.starting_route && this.route("", function() {
            routing.router.navigate(this.starting_route, {
                trigger: !0
            });
        });
    },
    articles: function() {
        this.route(":mode(/)", "stripTrailingSlash"), this.starting_route = "compare/" + app.helpers.drawer.getAllIds.call(app.instance).join("&");
    },
    "approval-river": function() {
        this.route(":mode(/)", "loadAllInSection"), this.starting_route = "my-recipes";
    },
    settings: function() {}
};

var init = {
    go: function() {
        var section = $("body").attr("data-section");
        templates.init[section].call(templates), models.init[section].call(models), collections.init[section].call(collections), 
        app.init[section].call(app), routing.init.go.call(routing, section);
    }
};

init.go();
//# sourceMappingURL=main.bundled.js.map