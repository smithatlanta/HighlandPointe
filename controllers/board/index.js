var fs = require('fs');

exports.index = function(req, res){
	fs.readdir('/home/masmith/projects/HighlandPointe/public/minutes', function(err, data){
		if (err)
			console.log(err);
		data.sort();
		data.reverse();
		res.render('board/index', { title: 'Highland Pointe Online - Board', "files": data });
	});
};
