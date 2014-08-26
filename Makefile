# Output Directory
PUBLIC_DIR = lib/public

all: js css serve

serve: 
	@node bin/www

js: 
	@echo ".js => bundled.js"
	@uglifyjs \
		$(PUBLIC_DIR)/javascripts/namespace.js \
		$(PUBLIC_DIR)/javascripts/helpers/*.js \
		$(PUBLIC_DIR)/javascripts/models/*.js \
		$(PUBLIC_DIR)/javascripts/collections/*.js \
		$(PUBLIC_DIR)/javascripts/app/*.js \
		$(PUBLIC_DIR)/javascripts/views/*.js \
		$(PUBLIC_DIR)/javascripts/routing/*.js \
		$(PUBLIC_DIR)/javascripts/init.js \
		--beautify -v=false --output $(PUBLIC_DIR)/javascripts/main.bundled.js

css:
	@echo "stylus => css"
	@stylus \
		--use nib \
		< $(PUBLIC_DIR)/stylesheets/style.styl \
		> $(PUBLIC_DIR)/stylesheets/style.css

.PHONY: all css js