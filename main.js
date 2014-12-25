var fs = require('fs');
var PEG = require("pegjs");

fs.readFile('./parser.js', 'utf8', function(err, data) {
    var parser = PEG.buildParser(data);
    var result = parser.parse(process.argv[2]);
    console.log(result.toString());
    console.log(result.truthTable());
});
