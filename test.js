const https = require('https');
https.get('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBd6mifRQ8XjSNVMCYmmDbs6wHjHH8ZMmA', res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => require('fs').writeFileSync('models.json', body));
});
