#!/bin/bash
nodemon -e jade,json,js,styl --ignore public/* ./bin/www.js run &
gulp watch-files
