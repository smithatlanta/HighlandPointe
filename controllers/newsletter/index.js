var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('public/issues', function(err, data){
		res.render('newsletter/index', { title: 'Highland Pointe Online', "files": data });
	});
};