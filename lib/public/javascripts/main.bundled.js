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
        ids = ids.split("&"), ids.forEach(function(id) {
            var where_obj = {};
            where_obj[idKey] = id, this.where(where_obj)[0].set(trueKey, bool);
        }, this);
    },
    addTagsFromId: function(objectList) {
        return objectList.forEach(function(item) {
            item.subject_tags = $.extend(!0, [], item.subject_tags.map(function(d) {
                return pageData.org.subject_tags.filter(function(f) {
                    return f.uid == d;
                })[0];
            })), item.events.forEach(function(ev) {
                ev.impact_tags = $.extend(!0, [], ev.impact_tags.map(function(d) {
                    return pageData.org.impact_tags.filter(function(f) {
                        return f.uid == d;
                    })[0];
                }));
            });
        }), objectList;
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
    getAssociatedItems: function(uid, itemKey, itemsObj) {
        return itemsObj = pageData[itemsObj], _.filter(itemsObj, function(obj) {
            return obj[itemKey] == uid;
        });
    },
    bakeRecipeUpdateForm: function(uid, source, settings, recipeName) {
        var markup = "", schema = {}, schema_with_selects = {};
        return $.extend(!0, schema, _.filter(pageData.recipeSchemas, function(recipeSchema) {
            return recipeSchema.source == source;
        })[0].schema), schema_with_selects = this.combineFormSchemaWithVals(schema, settings, recipeName), 
        markup = this.bakeForm(schema_with_selects);
    },
    combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName) {
        return schema_obj.name.selected = recipeName, _.each(settings_obj, function(setting, fieldName) {
            schema_obj[fieldName].selected = setting;
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
            var markup;
            return markup = '<div class="form-row">', markup += '<div class="form-row-label-container">', 
            markup += "<label>" + fieldNamePretty + "</label> ", markup += "</div>", markup += '<div class="form-row-input-container">', 
            markup += '<select id="' + fieldName + '" name="' + fieldName + '">', _.each(data.options, function(option) {
                var selected = "";
                data.selected == option && (selected = "selected"), markup += '<option value="' + option + '" ' + selected + ">" + option + "</option>";
            }), markup += "</select>", markup += "</div>", markup += "</div>";
        },
        checkbox: function(fieldName, fieldNamePretty, data) {
            var markup, banished_keys = [ "Requires approval" ];
            return _.contains(banished_keys, fieldNamePretty) ? "" : (markup = '<div class="form-row">', 
            markup += '<div class="form-row-label-container">', markup += "<label>" + fieldNamePretty + "</label> ", 
            markup += "</div>", markup += '<div class="form-row-input-container">', data.options.forEach(function(checkboxItem) {
                var checkboxId = _.uniqueId("NewsLynx|checkbox|" + fieldName + "|" + checkboxItem + "|");
                markup += '<div class="form-checkbox-group">', markup += '<input id="' + checkboxId + '" name="' + fieldName + "|" + checkboxItem + '" type="checkbox" />', 
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
        return term ? term.replace(/"/g, "&quot;") : !1;
    }
}, models.detail_item = {
    Model: Backbone.Model.extend({})
}, models.drawer_list_item = {
    Model: Backbone.Model.extend({
        idAttribute: "uid",
        defaults: {
            viewing: !1
        },
        toggle: helpers.modelsAndCollections.toggle
    })
}, models.org = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/organization/settings"
    })
}, models.recipe_creator = {
    Model: Backbone.Model.extend({
        urlRoot: "/api/recipes"
    })
}, models.river_item = {
    Model: Backbone.Model.extend({})
}, models.row_item = {
    Model: Backbone.Model.extend({})
}, models.tags = {
    Model: Backbone.Model.extend({
        defaults: {
            active: !1
        },
        toggle: helpers.modelsAndCollections.toggle
    })
}, collections.detail_items = {
    instance: null,
    Collection: Backbone.Collection.extend({
        model: models.detail_item.Model,
        getTrue: helpers.modelsAndCollections.getTrue,
        zeroOut: helpers.modelsAndCollections.zeroOut
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
        "click .view-all:not(.active)": "resetFull",
        "click .scroll-to": "scrollTo"
    },
    initialize: function() {
        this.$drawer = $("#drawer"), this.$content = $("#content"), this.$listContainer = $("#river-items-container"), 
        this.$recipes = $("#recipes"), this.$recipeCreators = $("#recipe-creators"), this.$divisionSwitcher = $(".division-switcher"), 
        this.$viewAll = $(".view-all"), this.isotopeCntnr = "#river-items-container", this.isotopeChild = ".article-detail-wrapper", 
        this.drawerData = pageData.accountRecipes, this["my-recipes"] = {
            detailData: pageData.riverItems,
            Model: models.river_item.Model
        }, this.listUid = "uid", this.detailUid = "source", this.listenTo(collections.drawer_items.instance, "change:viewing", app.helpers.itemDetail.go), 
        this.listenTo(collections.drawer_items.instance, "change:viewing", this.river.resetViewAllBtn), 
        this.listenTo(collections.detail_items.instance, "add", this.river.bake), this.listenTo(collections.detail_items.instance, "remove", this.river.destroy), 
        this.bake();
    },
    bake: function() {
        return collections.drawer_items.instance.each(function(recipe) {
            var recipe_view = new views.DrawerListItem({
                model: recipe
            });
            this.$recipes.append(recipe_view.render().el);
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
        }), app.helpers.isotope.initCntnr.call(this), this;
    },
    resetFull: function() {
        return routing.router.navigate(models.section_mode.get("mode") + "/all", {
            trigger: !0
        }), this;
    },
    scrollTo: function(e) {
        var dest = $(e.currentTarget).attr("data-destination");
        this.$content.animate({
            scrollTop: this.$content.scrollTop() + $("#" + dest + "-recipe").position().top - parseFloat(this.$content.css("padding-top"))
        }, 200);
    },
    divisionSwitcher: {
        updateHash: function(entering_mode) {
            var exiting_hash = window.location.hash, exiting_mode = routing.helpers.getMode(exiting_hash), exiting_uids = routing.helpers.getArticleUids(exiting_hash), previous_uids = models.section_mode.get("previous-uids") || "all", entering_hash = entering_mode;
            "my-recipes" == exiting_mode && exiting_uids ? models.section_mode.set("previous-uids", exiting_uids) : "create-new" == exiting_mode && previous_uids && (entering_hash += "/" + previous_uids), 
            routing.router.navigate(entering_hash, {
                trigger: !0
            });
        }
    },
    river: {
        bake: function(detailModel) {
            {
                var item_view, item_el;
                models.section_mode.get("mode"), detailModel.get("uid");
            }
            return item_view = new views.RiverItem({
                model: detailModel
            }), item_el = item_view.render().el, this.$listContainer.append(item_el), app.helpers.isotope.addItem.call(app.instance, item_el), 
            this;
        },
        destroy: function(detailModel) {
            detailModel.set("destroy", !0);
        },
        resetViewAllBtn: function() {
            var active_filters = collections.drawer_items.instance.where({
                viewing: !0
            }).length, filters_enabled = active_filters == app.instance.drawerData.length;
            this.$viewAll.toggleClass("active", filters_enabled).find("input").prop("checked", filters_enabled);
        }
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
        }, console.log(this.single.detailData), this.listUid = "uid", this.detailUid = "article_uid", 
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
            return console.log("here"), collections.detail_items.instance.remove(collections.detail_items.instance.models), 
            this;
        },
        updateHash: function(entering_mode, new_uid) {
            app.helpers.isotope.clearCntnr.call(app.instance);
            var hash_arr = current_uids = [], new_uids = new_uid || models.section_mode.get("previous-uids") || "";
            return routing.helpers.getArticleUids(window.location.hash) && (hash_arr = window.location.hash.split("/"), 
            current_uids = hash_arr.slice(1, hash_arr.length)[0].split("&"), new_uids = new_uids || current_uids, 
            "single" == entering_mode && current_uids.length > 1 && !new_uid && (new_uids = current_uids[0]), 
            _.isArray(new_uids) && (new_uids = new_uids.join("&"))), routing.router.navigate(entering_mode + "/" + new_uids, {
                trigger: !0
            }), _.isArray(current_uids) && 0 === current_uids.length && (current_uids = ""), 
            models.section_mode.set("previous-uids", current_uids), this;
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
                        if (input_obj[input_key] = val, $this.attr("data-uid")) {
                            var uid = $this.attr("data-uid");
                            "false" === uid && (uid = null), input_obj.uid = parseFloat(uid);
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
        add: function(mode, uids) {
            app.helpers.drawer.setModeOnly(mode), uids && collections.drawer_items.instance.setBoolByIds("viewing", this.listUid, uids, !1), 
            uids && collections.drawer_items.instance.setBoolByIds("viewing", this.listUid, uids, !0);
        },
        remove: function(mode, uids) {
            app.helpers.drawer.setModeOnly(mode), uids && collections.drawer_items.instance.setBoolByIds("viewing", this.listUid, uids, !1);
        },
        determineBehavior: function() {
            var behavior = "radio";
            return "compare" == models.section_mode.get("mode") && (behavior = "checkbox"), 
            behavior;
        },
        getAllUids: function() {
            var uids = [];
            return _.each(this.drawerData, function(drawerDatum) {
                uids.push(drawerDatum[this.listUid]);
            }, this), uids;
        }
    },
    itemDetail: {
        go: function(listItemModel) {
            var destination, action, is_new = listItemModel.get("viewing"), uid = listItemModel.get(this.listUid);
            return is_new ? (destination = app.helpers.itemDetail.add, action = "add") : (destination = app.helpers.itemDetail.remove, 
            action = "remove"), app.helpers.itemDetail.fetch.call(this, uid, action, destination), 
            this;
        },
        fetch: function(itemUid, action, cb) {
            var mode = models.section_mode.get("mode"), loaded_matches = _.filter(this[mode].detailData, function(obj) {
                return obj[app.instance.detailUid] === itemUid;
            });
            if (loaded_matches.length) cb.call(this, loaded_matches); else if ("remove" != action) {
                var new_article_detail = new this[mode].Model();
                new_article_detail.fetch({
                    data: itemUid,
                    success: function(model, response) {
                        console.log("success"), cb(response[0]);
                    },
                    error: function() {
                        console.log("Error fetching article " + itemUid);
                    }
                });
            }
        },
        add: function(itemData) {
            itemData.forEach(function(itemDatum) {
                collections.detail_items.instance.add(itemDatum);
            });
        },
        remove: function(itemData) {
            var that = this;
            itemData.forEach(function(itemDatum) {
                var detailUid = itemDatum[that.detailUid], where_obj = {};
                where_obj[that.detailUid] = detailUid, collections.detail_items.instance.remove(collections.detail_items.instance.where(where_obj)[0]);
            });
        },
        removeAll: function() {
            collections.detail_items.instance.set([]);
        }
    },
    isotope: {
        initCntnr: function() {
            this.$isotopeCntnr || (this.$isotopeCntnr = this.$listContainer, this.$isotopeCntnr.isotope({
                itemSelector: this.isotopeChild,
                layoutMode: "fitRows",
                getSortData: {
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
            var utc_date = that.formatDate.parse(d.datetime), user_timezone_date = new Date(utc_date.setHours(utc_date.getHours() + parseFloat(pageData.org.timezone)));
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
        return this.$el.html(article_detail_markup), this.$el.attr("data-title", model_json.title).attr("data-date", model_json.datetime), 
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
                    return f.uid == d.id;
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
        row.append("div").classed("cell", !0).classed("title", !0).classed("wide", !0).attr("data-article_uid", function(d) {
            return d.article_uid;
        }).html(function(d) {
            return d.title;
        }), row.append("div").classed("cell", !0).classed("date", !0).classed("single", !0).attr("data-date", function(d) {
            return d.datetime;
        }).html(function(d) {
            return helpers.templates.conciseDate(d.datetime);
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
        var article_uid = $(e.currentTarget).attr("data-article_uid");
        app.instance.divisionSwitcher.updateHash("single", article_uid);
    },
    close: function() {
        var behavior = app.helpers.drawer.determineBehavior();
        routing.router.set[behavior](this.model.get(app.instance.detailUid));
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
        "click .drawer-list-outer": "setHash",
        "click .enable-switch": "toggleEnabled",
        "click .cancel": "toggleModal",
        "click .settings-switch": "toggleModal",
        "click .modal-overlay": "toggleModal",
        "click input": "killEvent",
        "click select": "killEvent",
        "submit form": "saveModal",
        "click .destroy": "destroyModel"
    },
    initialize: function() {
        this.listenTo(this.model, "change:viewing", this.setActiveCssState), this.listenTo(this.model, "change:enabled", this.renderEnabled);
    },
    render: function() {
        var drawer_list_item_markup = templates.drawerListItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(drawer_list_item_markup), this.$form = this.$el.find("form"), 
        this;
    },
    renderEnabled: function() {
        var enabled = this.model.get("enabled");
        this.$el.find(".enable-switch").attr("data-enabled", enabled).html(helpers.templates.formatEnabled(enabled));
    },
    toggleModal: function(e) {
        this.killEvent(e), views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        e.preventDefault();
        var that = this, recipe_data = this.remodelRecipeJson();
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
            type: this.model.get("type")
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
        var uids = routing.helpers.getArticleUids(window.location.hash);
        return "all" != uids ? (this.$el.find(".drawer-list-outer").toggleClass("active", model.get("viewing")), 
        this.$el.find(".inputs-container input").prop("checked", model.get("viewing"))) : (this.$el.find(".drawer-list-outer").toggleClass("active", !1), 
        this.$el.find(".inputs-container input").prop("checked", !1)), this;
    },
    setHash: function() {
        var behavior = app.helpers.drawer.determineBehavior();
        return routing.router.set[behavior](this.model.get(app.instance.listUid)), this;
    }
}), views.DrawerListItemStatic = Backbone.View.extend({
    tagName: "li",
    className: "drawer-list-item",
    initialize: function() {},
    render: function() {
        var drawer_list_item_markup = templates.drawerListItemStaticFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(drawer_list_item_markup), this;
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
        this;
    },
    save: function(e) {
        e.preventDefault();
        {
            var recipe_data = this.remodelRecipeJson();
            new models.recipe_creator.Model();
        }
        console.log(recipe_data);
    },
    remodelRecipeJson: function() {
        var serializedArray = this.$form.serializeArray(), recipe_info = {
            source: this.model.get("source"),
            type: this.model.get("type")
        }, set_default_event = this.model.get("set_default_event"), model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray, set_default_event);
        return model_json;
    },
    toggleDefaults: function() {
        this.model.set("set_default_event", !this.model.get("set_default_event"));
    },
    showHideDefaults: function() {
        var open = this.model.get("set_default_event");
        open ? this.$defautEventsBtn.html("Enabled").attr("data-status", "open") : this.$defautEventsBtn.html("Disabled").attr("data-status", "closed"), 
        this.$defaultEvents.toggle(open);
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
        var river_item_markup = templates.riverItemFactory(_.extend(this.model.toJSON(), helpers.templates));
        return this.$el.html(river_item_markup), this;
    },
    toggleModal: function(e) {
        views.helpers.toggleModal(e);
    },
    saveModal: function(e) {
        console.log("Saved"), views.helpers.toggleModal(e), this.removeItem("save");
    },
    makeInsignificant: function() {
        this.removeItem("delete");
    },
    removeItem: function(mode) {
        this.model.set("destroy", mode);
    },
    destroy: function() {
        var destroy_mode = this.model.get("destroy");
        destroy_mode === !0 && (app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove()), 
        "delete" == destroy_mode ? app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove() : "save" == destroy_mode && (app.instance.$isotopeCntnr ? app.instance.$isotopeCntnr.isotope("remove", this.$el).isotope("layout") : this.remove());
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
            top: (v_height / 2 - el_height) / v_height * 100 + "%",
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
            return 1 == list.length ? list[0].value : list.map(function(f) {
                return f.value;
            });
        }).map(inputArrays);
        return inputObj;
    },
    remodelRecipeJson: {
        create: function(formInfo, formInputsArray, setDefaultEvent) {
            var input_obj = views.helpers.formSerialToObject(formInputsArray);
            return formInfo.name = input_obj.name, delete input_obj.name, formInfo.settings = input_obj, 
            formInfo.default_event = {}, setDefaultEvent && (formInfo.default_event = {
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
            formInfo.settings = input_obj, formInfo.default_event = {}, formInfo;
        }
    }
}, routing = {
    Router: Backbone.Router.extend({
        initialize: function(section) {
            this.history = [], this.listenTo(this, "route", function(name, args) {
                _.isUndefined(args[1]) || this.history.push({
                    name: name,
                    mode: args[0],
                    uids: args[1],
                    fragment: Backbone.history.fragment
                });
            }), routing.init[section].call(this), routing.init.common.call(this);
        },
        stripTrailingSlash: function(mode) {
            app.helpers.drawer.setMode(mode), routing.router.navigate(mode, {
                replace: !0
            });
        },
        readPage: function(mode, uids) {
            mode = mode.replace(/\//g, ""), uids = routing.helpers.diffUids.call(this, mode, uids), 
            uids.exiting && app.helpers.drawer.remove.call(app.instance, mode, uids.exiting), 
            uids.entering && app.helpers.drawer.add.call(app.instance, mode, uids.entering), 
            uids.exiting || uids.exiting || app.helpers.drawer.setModeOnly(mode);
        },
        set: {
            radio: function(uid, trigger) {
                _.isUndefined(trigger) && (trigger = !0), routing.router.navigate(models.section_mode.get("mode") + "/" + uid, {
                    trigger: trigger
                });
            },
            checkbox: function(articleUid) {
                var hash = window.location.hash, hash_test = routing.helpers.getArticleUids(hash), exists = routing.helpers.exists(hash, articleUid);
                exists ? hash = hash.replace(new RegExp("(&|)" + articleUid, "g"), "").replace("/&", "/") : (hash_test ? hash += "&" : "/" != hash.substr(hash.length - 1, 1) && (hash += "/"), 
                hash += articleUid), routing.router.navigate(hash, {
                    trigger: !0
                });
            }
        }
    }),
    helpers: {
        diffUids: function(mode, newUids) {
            var obj = {};
            if ("all" == newUids && (newUids = app.helpers.drawer.getAllUids.call(app.instance).join("&")), 
            "create-new" == mode) return !1;
            if (!this.history.length || !this.history[this.history.length - 1].uids) return this.history[this.history.length - 2] ? {} : (obj.entering = newUids, 
            obj);
            var previous_uids = this.history[this.history.length - 1].uids.split("&"), newUids = newUids.split("&"), previous_uids_sorted = previous_uids.concat().sort(helpers.common.sortNumber), newUids_sorted = newUids.concat().sort(helpers.common.sortNumber), previous_mode = this.history[this.history.length - 1].mode;
            return "all" == previous_uids && (previous_uids = app.helpers.drawer.getAllUids.call(app.instance)), 
            "compare" == mode ? newUids.length > previous_uids.length ? "compare" == previous_mode ? obj.entering = _.difference(newUids, previous_uids).join("&") : "single" == previous_mode && (obj.entering = newUids.join("&"), 
            obj.exiting = previous_uids.join("&")) : newUids.length < previous_uids.length ? obj.exiting = _.difference(previous_uids, newUids).join("&") : _.isEqual(newUids_sorted, previous_uids_sorted) ? obj.entering = newUids.join("&") : newUids.length == previous_uids.length && (obj.entering = newUids.join("&"), 
            obj.exiting = previous_uids.join("&")) : "single" == mode ? previous_uids.length > 1 ? (obj.entering = _.intersection(newUids, previous_uids).join("&"), 
            obj.exiting = _.difference(previous_uids, newUids).join("&")) : _.isEqual(newUids_sorted, previous_uids_sorted) ? obj.entering = newUids.join("&") : (obj.entering = newUids.join("&"), 
            obj.exiting = previous_uids.join("&")) : "my-recipes" == mode && (obj.entering = newUids.join("&"), 
            obj.exiting = previous_uids.join("&")), obj;
        },
        getMode: function(hash) {
            return hash.split("/")[0].replace(/#/g, "");
        },
        getArticleUids: function(hash) {
            return hash.split("/")[1];
        },
        exists: function(hash, articleUid) {
            var uid_regex = new RegExp(articleUid);
            return uid_regex.test(hash);
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
        this.section_mode = new (Backbone.Model.extend({}))(), this.section_mode.set("mode", "my-recipes");
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
        this.detail_items.instance = new this.detail_items.Collection([]);
    },
    settings: function() {}
}, app.init = {
    articles: function() {
        this.instance = new this.Articles();
    },
    "approval-river": function() {
        this.instance = new this.ApprovalRiver();
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
        this.route(":mode/:uid", "readPage"), this.starting_route && this.route("", function() {
            routing.router.navigate(this.starting_route, {
                trigger: !0
            });
        });
    },
    articles: function() {
        this.route(":mode(/)", "stripTrailingSlash"), this.starting_route = "compare/" + app.helpers.drawer.getAllUids.call(app.instance).join("&");
    },
    "approval-river": function() {
        this.route(":mode(/)", "readPage"), this.starting_route = "my-recipes/all";
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