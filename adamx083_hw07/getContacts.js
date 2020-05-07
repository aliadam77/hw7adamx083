var mysql = require("mysql");

var con = mysql.createConnection({
  host: "cse-larry.cse.umn.edu",
  user: "C4131S20U2", // replace with the database user provided to you
  password: "34", // replace with the database password provided to you
  database: "C4131S20U2", // replace with the database user provided to you
  port: 3306
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
   console.log("Connected to MYSQL database!");
});


con.query('SELECT * FROM tbl_contacts', function(err,rows,fields) {
	if (err) throw err;
	if (rows.length == 0)
		console.log("No entries in books table");
	else {
		for (var i = 0 ; i < rows.length; i++){
			console.log(rows[i].contact_id + " " + rows[i].contact_name + " " + rows[i].contact_email + " " + rows[i].contact_address+ " " 
				+ rows[i].contact_phone + " " + rows[i].contact_favouriteplace + " " + rows[i].contact_favouriteplaceurl + " " );
    }
	}
});