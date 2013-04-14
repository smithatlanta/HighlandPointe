var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('/home/masmith/projects/HighlandPointe/public/issues', function(err, data){
		if (err)
			console.log(err);
		data.sort();
		data.reverse();
		res.render('newsletter/index', { title: 'Highland Pointe Online', "files": data });
	});
};
