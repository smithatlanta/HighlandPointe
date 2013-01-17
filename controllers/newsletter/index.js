var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('public/issues', function(err, data){
		if (err)
			console.log(err);

		res.render('newsletter/index', { title: 'Highland Pointe Online', "files": data });
	});
};