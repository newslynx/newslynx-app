var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var queue = require('queue-async');
var app = require('../app');
var settings = require('../settings');
var utils = require('../utils');
var request = require('request');
var debug = require('tracer').console();

function readFileAsUtf8(path, cb){
	fs.readFile(path, 'utf-8', cb);
}

function readFileAsJson(path, cb){
	fs.readFile(path, 'utf-8', function(err, result){
		cb(null, JSON.parse(result));
	});
}

function sendToApi(req,res){
	return function(path, cb){
		req.url = path;
		utils.auth.relay(req, res, function(err, status, body){
			cb(err, body);
		});
	}
}

function sanitize(title){
	return title.toLowerCase().replace(/ /g, '-');
}

/* GET home page. */
router.get('/', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Home';
	info.page = sanitize(info.title);
  res.render('index', info);
});

router.get('/about', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'About';
	info.page = sanitize(info.title);
  res.render('about', info);
});

router.get('/settings', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req,res), '/api/organization/settings')
			.awaitAll(function(err, results){
				info.org = results[0];
				res.render('settings', info);
			});
});

router.get('/approval-river', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Approval River';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/organization/settings')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/recipe-schemas.json')
		.defer(sendToApi(req, res), '/api/recipes')
		.defer(sendToApi(req, res), '/api/alerts')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema-alert-data.json')
		.defer(sendToApi(req, res), '/api/articles?fields=id,title')
		.defer(sendToApi(req, res), '/api/organization/settings') // Replace this with org info endpoint
			.awaitAll(function(err, results){
				debug.log(err)
				// Data
				info.org  					  = results[0];
				info.recipeSchemas    = results[1];
				info.accountRecipes   = results[2];
				info.alerts           = results[3];

				var event_schema		        = results[4];
				var event_schema_alert_data	= results[5];

				// Replace this with results[6]
				info.articleSkeletons =[{"id":187,"title":"An upstate-downstate clash for lieutenant governor"},{"id":188,"title":"Festival gives the peach its due"},{"id":189,"title":"The week looks to be mild and pleasant after September&#x2019;s hot start"},{"id":190,"title":"ATV with keys in the ignition primed for theft"},{"id":191,"title":"Three injured, one seriously, in crash at Niagara County intersection"},{"id":192,"title":"Kennedy-Grant Senate race gains attention, cash from outside groups"},{"id":193,"title":"Pushing drugs in the NFL locker room"},{"id":194,"title":"Man struck by two hit-and-run vehicles in Buffalo dies in ECMC"},{"id":195,"title":"Making a case for the NFL blackout rule"},{"id":270,"title":"People Talk / A conversation with hoop dancer Kristin M. Damstetter"},{"id":196,"title":"Tops plans Monday grand-opening ceremony for Newfane store"},{"id":227,"title":"Army holds off UB&#x2019;s late rally"},{"id":197,"title":"House tours highlight debut of Dunkirk Heritage Festival"},{"id":182,"title":"Cuomo, Hochul ignore Teachout at parade"},{"id":228,"title":"PrepTalkLive: High school football&#x2019;s opening night"},{"id":14,"title":"Eat local, fresh and organic"},{"id":15,"title":"Two men killed in double shooting"},{"id":185,"title":"Two men shot to death outside club"},{"id":18,"title":"Man suffers serious injuries by two hit-and-run vehicles"},{"id":95,"title":"Second quarter sparks Hamburg over Lake Shore"},{"id":96,"title":"Westfield/Brocton back on field after last year&#x2019;s tragedy"},{"id":17,"title":"Brandon, Marrone deny report of spat"},{"id":161,"title":"Audience has chance to catch a falling star"},{"id":19,"title":"Erie County, Newstead finalize parkland sale"},{"id":16,"title":"Bills&#x2019; Williams looks primed for redemption"},{"id":20,"title":"Fire hits home on Wilkes Avenue"},{"id":97,"title":"Run-happy Army will test Bulls defense"},{"id":98,"title":"Bulls notebook: Quinn had a say in scheduling of Army"},{"id":99,"title":"High School Extra for Sept. 6: Sectionals to Sunshine Park"},{"id":21,"title":"Monroe County motorcyclist killed in Orleans County crash"},{"id":22,"title":"State to start major repaving work on Route 60 south of Fredonia"},{"id":23,"title":"Ahlas declares candidacy for Lewiston board seat"},{"id":24,"title":"Pendleton man and three teens charged in Cambria burglary"},{"id":25,"title":"Niagara welfare fraud task force nets nearly $82,000"},{"id":26,"title":"Erie County to hold 3 rabies clinics in September"},{"id":27,"title":"Unitarian Church of Buffalo selects interim minister"},{"id":100,"title":"Depew-Alden: To be continued..."},{"id":101,"title":"Storm ends Senior Porter Cup at two rounds"},{"id":102,"title":"Veronica&#x2019;s long years as coach paved way to Hall of Fame"},{"id":28,"title":"Buffalo man with long prison record arrested in drug raid"},{"id":103,"title":"Area College Scores for Sept. 6"},{"id":104,"title":"Area Bowling for Sept. 6"},{"id":30,"title":"North Tonawanda Council may have to hold off on Purple Heart Highway"},{"id":31,"title":"Lockport assessor criticizes tax break for health club"},{"id":49,"title":"Fallsview Casino evacuated due to bomb threat"},{"id":50,"title":"Man talked out of jumping over falls"},{"id":117,"title":"AMRI shifts into protein production"},{"id":105,"title":"Strander joins Canisius Hockey"},{"id":32,"title":"Governor&#x2019;s primary race is ending the same way it began"},{"id":137,"title":"In the Field: A needed hand for those who hit bottom"},{"id":29,"title":"Anne Frank Project aims to show the power of storytelling"},{"id":90,"title":"Three two-story homes destroyed in Niagara Falls fire"},{"id":91,"title":"A three-way race for Lancaster town justice"},{"id":11,"title":"PrepTalkLive: High school football&#x2019;s opening night"},{"id":92,"title":"Pair indicted on federal charges linked to Chautauqua violinist&#x2019;s murder"},{"id":118,"title":"S&P 500 establishes another record on a positive day for the stock market"},{"id":119,"title":"Alibaba seeks to raise $21.1 billion"},{"id":115,"title":"Evans Bancorp CEO denies &#x2018;redlining&#x2019; allegations"},{"id":107,"title":"The Watch List for Sept. 6"},{"id":108,"title":"Bills officials deny report of shouting match"},{"id":116,"title":"Job growth fell short in August"},{"id":143,"title":"Rivers was always a little Joan Molinsky to the end"},{"id":144,"title":"Sew Simple By Vicki Farmer Ellis"},{"id":145,"title":"Antiques by Terry and Kim Kovel"},{"id":146,"title":"Poker by Chad Holloway"},{"id":147,"title":"John Rosemond: Late nights, not school start time, problem for teens"},{"id":148,"title":"Refresh Calendar for Sept. 6 to 13 events"},{"id":149,"title":"The Kids&#x2019; Doctor: No proof essential oils boost immune system"},{"id":142,"title":"Empty nests change relationships"},{"id":150,"title":"Exercise helps to prevent falls"},{"id":151,"title":"Seated cable row strengthens back muscles"},{"id":152,"title":"Careful meal timing can help you lose weight"},{"id":153,"title":"Reduce your exposure to toxins from grilled meats"},{"id":139,"title":"Antioxidant-rich foods help your immune system ward off disease"},{"id":140,"title":"Tweak your diet to control potentially harmful inflammation"},{"id":154,"title":"People&#x2019;s Pharmacy: Yogurt worked to overcome hard-to-treat heartburn"},{"id":155,"title":"Drs. Oz and Roizen: The plant power diet"},{"id":156,"title":"Personal Health: Don&#x2019;t catch what ails your house"},{"id":157,"title":"Some heart attack triggers might surprise you"},{"id":158,"title":"Health fair today in Orchard Park"},{"id":141,"title":"Roizen coming back to hometown for Larkinville talk"},{"id":163,"title":"TIFF 2014: Praise for 'Sils Maria'"},{"id":33,"title":"Murder of Kenmore bar owner linked to fight over stolen check"},{"id":120,"title":"Solo 401(k) is good option for the self-employed"},{"id":121,"title":"Wall Street: Stocks drop after US hiring slows"},{"id":164,"title":"Peach festival, classic boats up this weekend"},{"id":122,"title":"Graham Corp.&#x2019;s latest orders for refining equipment reach $7.5 million"},{"id":165,"title":"TIFF 2014: Happy Bill Murray Day"},{"id":166,"title":"Farrell Four: The best of weekend club shows"},{"id":123,"title":"First Niagara combines consumer banking groups"},{"id":124,"title":"Ex-Five Star exec to receive $184,500"},{"id":109,"title":"Field tight for Senior Porter Cup finale"},{"id":125,"title":"N.Y. slashes health rate hikes sought by insurers"},{"id":169,"title":"Crow warms up crowd nicely for Rascal Flatts"},{"id":111,"title":"Bills notebook: Spiller will return kickoffs"},{"id":112,"title":"HIGH SCHOOL SCORES for Sept. 5"},{"id":113,"title":"AREA COLLEGE SCORES for Sept. 5"},{"id":114,"title":"Area Golf for Sept. 5"},{"id":110,"title":"Bills GM anxious to see team move forward"},{"id":126,"title":"United Memorial hospital CEO to step down in December"},{"id":127,"title":"Cleveland BioLabs wins approval for advancement of radiation drug"},{"id":128,"title":"22nd Century may soon start cigarette production"},{"id":129,"title":"Hot WNY housing market slipped a bit over the summer"},{"id":130,"title":"Solar panels installed at Amherst Crosby&#x2019;s"},{"id":131,"title":"On the Record / Sept. 5, 2014"},{"id":13,"title":"Tuesday will provide answers to big questions"},{"id":167,"title":"Christmas music is here"},{"id":170,"title":"Comedian Joan Rivers dies at age 81"},{"id":132,"title":"Wall Street: stocks not doing much today"},{"id":133,"title":"City Honors grad named U.S. chief technology officer"},{"id":171,"title":"The official Gusto summer quiz"},{"id":168,"title":"Miranda Lambert earns record-tying 9 CMA noms"},{"id":172,"title":"Retro-indie arrives: Bad Suns, good kids"},{"id":134,"title":"SBA loans on the rise through August"},{"id":135,"title":"E&E gets contract extension in Kansas City"},{"id":173,"title":"Toronto International Festival opens"},{"id":159,"title":"Gusto theater guide 2014-&#x2019;15"},{"id":136,"title":"Auto sales continue rebound"},{"id":174,"title":"New Theatre of Youth program aims to hook &#x2018;em while they&#x2019;re young"},{"id":175,"title":"Winfield's Pub specializes in 'real' cooking"},{"id":176,"title":"Savoy Brown: The British blues brothers"},{"id":177,"title":"Area chefs cook their hearts out for Iron Event"},{"id":178,"title":"Buddy movie gets its groove back with &#x2018;Land Ho!&#x2019;"},{"id":179,"title":"Hallwalls welcomes back free jazz legend"},{"id":180,"title":"Echo Art Fair returns to the Central Library"},{"id":160,"title":"Review: Dierks Bentley stages a night to remember"}];   
				info.orgInfo = results[7];
				// Add a list of tag names to the default event schema
				event_schema = utils.transform.populateDefaultEventWithTags(results[0].impact_tags, event_schema);
				// Add this schema to each recipe schema
				info.recipeSchemas = utils.transform.populateRecipeSchemasWithDefaultEvent(info.recipeSchemas, event_schema);
				// Extend the event creator schema, which by default is just some info about alerts like `link`, `timestamp`, and `text`
				// With this default event, which will have tags and things
				info.eventSchema = utils.transform.populateEventCreatorSchemaWithDefaultEvent(event_schema_alert_data, event_schema);

				res.render('approval-river', info);
			});
});

router.get('/articles', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Articles';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/tags/impact/attributes/categories')
		.defer(sendToApi(req, res), '/api/tags/impact/attributes/levels')
		.defer(sendToApi(req, res), '/api/tags/subject')
		.defer(sendToApi(req, res), '/api/tags/impact')
		.defer(sendToApi(req, res), '/api/articles')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema-alert-data.json')
		.defer(sendToApi(req, res), '/api/organization/settings') // Replace this with org info endpoint
		.defer(readFileAsJson, 'lib/public/data/not-used/event-schemas.json')
			.awaitAll(function(err, results){
				debug.log(err)
				// debug.log(results[1])
				// debug.log(results[2])
				// debug.log(results[3])
				// debug.log(results[4])
				// debug.log(results[5])
				// debug.log(results[6])
				// Data
				info.impact_tag_categories = results[0];
				info.impact_tag_levels = results[1];
				info.subject_tags = results[2];
				info.impact_tags = results[3];
				var article_summaries  = results[4];

				// TEMPORARY STEP, `event_schema_alert_data` and `event_schema` should more accurately array of objects to begin with.
				var event_schema		        = results[5];
				var event_schema_alert_data	= results[6];

				event_schema = utils.transform.imbueListOptionsWithAccountData(event_schema);

				event_schema 						= utils.transform.objToArr(event_schema);
				event_schema_alert_data = utils.transform.objToArr(event_schema_alert_data);

				var event_schema_full = event_schema_alert_data.concat(event_schema);
				info.eventCreatorSchema = event_schema_full;

				info.orgInfo = results[7];
				article_summaries = utils.transform.addTopLevelQuantMetrics(article_summaries);
				article_summaries = utils.transform.hydrateTagsInfo(article_summaries, info.orgInfo, ['subject_tags', 'impact_tags']);


				// TEMPORARY, to be replaced with impact tags and impact categories combinatoin
				info.impactCategoriesInfo = results[8];

				// Add our metrics onto `info`
				info.articleSummaries = article_summaries;
				res.render('articles', info);
			});
});

router.all('/api/*', function(req, res){
  utils.auth.relay(req, res);
});

router.get('/auth/google', function(req, res) {
	res.redirect(settings.api + '/auth/google?apikey=' + req.session.apikey);
});

router.get('/auth/twitter', function(req, res) {
	res.redirect(settings.api + '/auth/twitter?apikey=' + req.session.apikey);
});

module.exports = router;
