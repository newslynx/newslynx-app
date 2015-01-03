(function(obj){
	'use-strict';

	// Take in a list of things or a dictionary and output a zip of those files
	// Can convert them to `csv` if so desired
	function zipMultiple(files, outputFormat, callback, prettyKeys) {
		// Cache the `createObjectURL` function cross-browserly
		var URL = obj.webkitURL || obj.mozURL || obj.URL,
				createObjectURL = URL.createObjectURL; // Convert a compressed blob object to a data URL

		var addIndex = 0,
				writer = new zip.BlobWriter("application/zip"),
				zipWriter,
				csvFormatter = d3, 
				prettyKeys = prettyKeys || {}; // Set this to an empty object if undefined so we can use `prettyKeys[foo]]` later on and that will return `undefined` if we don't have a conversion for that or or no `prettyKeys` is set.

		// They need to be turned into an array of strings
		files_reformatted = formatFiles(files, outputFormat, prettyKeys);

		function nextFile() {
			var file = files_reformatted[addIndex],
					type = (outputFormat == 'txt') ? 'text/plain' : 'text/csv',
			 		blob = new Blob([ file.values ], { type : type }),
					blob_reader = new zip.BlobReader(blob),
					filename = file.key || 'file-'+addIndex; // If it's a list, we don't have a name for each file

			zipWriter.add(filename+'.'+outputFormat, blob_reader, function(){
				addIndex++;
				if (addIndex < files_reformatted.length) {
					nextFile();
				} else {
					zipWriter.close(function(zippedBlob){
						var zipped_blog_href = createObjectURL(zippedBlob);
						callback(zippedBlob, zipped_blog_href);
					});
				}
			});
		}

		function formatFiles(files, outputFormat, prettyKeys){
			// Deep copy this
			// TODO, use jQuery extend if that's faster
			var reformatted = JSON.parse(JSON.stringify(files)),
					tmp = [];

			// If `files` is a we need to map it to having an object of the format below
			// If it's a `dict` we need to convert that to a list-ish object, stashing the key as `<list_item>.key`
			if (Array.isArray(reformatted)){
				reformatted.forEach(function(val, index){
					var obj = {};
					obj.values = val;
					obj.key = 'file-'+index;
				});
			} else if (typeof reformatted == 'object') {
				for (var key in reformatted){
					if (reformatted.hasOwnProperty(key)){
						var obj = {},
								value = reformatted[key];
						obj.values = value;
						obj.key = prettyKeys[key] || key;
						tmp.push(obj);
					}
				}
				reformatted = tmp;
			}

			// `outputFormat` can be `txt` or `csv`
			// It will return an object of the format {key: :string, value: :string}
			// If it's text, stringify the value of `values`
			if (outputFormat == 'txt'){
				reformatted.forEach(function(val){
					if (typeof val.values != 'string'){
						val.values = JSON.stringify(val.values);
					}
				});
			} else if (outputFormat == 'csv') {
				reformatted.forEach(function(val){
					val.values = csvFormatter.csv.format(val.values);
				});
			}

			return reformatted;
		}

		zip.createWriter(writer, function(writer) {
			zipWriter = writer;
			nextFile();
		}, reportError);

	}

	function reportError(message) {
	  console.error(message);
	}

	obj.zip.zipMultiple = zipMultiple;

})(this);