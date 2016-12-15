var express = require('express');
var app = express();

app.use(express.static('/Users/azizkhilawala/Documents/Repositories/D3Project3/arvind-code/aziz2/aziz/'));

app.listen(9001, function() {
    console.log('Example app listening on port 9001!');
});
