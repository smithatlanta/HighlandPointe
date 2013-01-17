var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('public/minutes', function(err, data){
		res.render('board/index', { title: 'Highland Pointe Online', "files": data });
	});
};