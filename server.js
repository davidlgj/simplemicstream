var http = require('http')
var spawn = require('child_process').spawn

var ps = null

http.createServer(function (req, res) {
  console.log('New request')
  
  //url /audio.wav starts streaming from usb mic
  if (req.url === '/audio.wav') {
    
    //if command is not started, start it
    if (ps === null) {
      res.writeHead(200,{'Content-Type': 'audio/wav'})
  
      console.log('Spawning arecord')
      ps = spawn('arecord',['-D','plughw:1,0','-f','dat'])
      
      ps.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
      })
    
      ps.stdout.on('data', function (data) {
        console.log('sending data to client ')
        res.write(data)
      })
      
      
      ps.on('exit', function (code) {
        ps = null
        res.end()
        console.log('child process exited with code ' + code)
      })   
      
      res.on('end',function(){
        console.log('End of stream')
      })
      
      res.on('close',function(){
        console.log('stream got closed by client')
        //end it if stream gets closed.
        ps.kill('SIGHUP')
      })
      
    } else {
      res.writeHead(503,{'Content-Type': 'text/html'})
      res.end('<html><head><title>Service Unavailable</title></head><body>Audio stream is already taken.</body></html>')
    }
  } else {
    //everything else just sends a html response with an audio tag
    res.writeHead(200,{'Content-Type': 'text/html'})
    res.write('<!DOCTYPE html>')
    res.write('<html>')
    res.write('<head>')
    res.write('<title>Simple Stream</title>')
    res.write('</head>')
    res.write('<body>')
      res.write('<audio src="/audio.wav" preload="none" controls > ')
      res.write('</audio>')
    res.write('</body>')
    res.write('</html>')
    res.end()
  }
    
  
  
}).listen(9000)

console.log('Server started on port 9000')
