var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('./public/minutes', function(err, data){
		if (err)
			console.log(err);
		data.sort();
		data.reverse();
		res.render('board/index', { title: 'Highland Pointe Online', "files": data });
	});
};