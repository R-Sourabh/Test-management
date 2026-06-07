const http = require('http');
http.createServer((req, res) => {
  console.log(req.method, req.url, req.headers);
  res.writeHead(200);
  res.end();
}).listen(9090);
