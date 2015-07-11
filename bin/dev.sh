#!/bin/bash
nodemon -e jade,json,js --ignore public/* ./bin/www.js run &
gulp watch-files
