//    Copyright 2013 David Jensen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

var http = require('http')
var spawn = require('child_process').spawn

var ps = null

//check argv for a port
var PORT = process.argv.length > 2?parseInt(process.argv[2],10):9000


http.createServer(function (req, res) {
  
  
  
  //url /audio.wav starts streaming from usb mic
  if (req.url === '/audio.wav') {
    console.log('Request for audio file')
    
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
      console.log('USB mic already taken')
      res.writeHead(503,{'Content-Type': 'text/html'})
      res.end('<html><head><title>Service Unavailable</title></head><body>Mic stream is already taken.</body></html>')
    }
  } else if (req.url === '/kill' && ps !== null) {
    console.log('Killing arecord')
    res.writeHead(302,{'Location': '/'})
    ps.kill()
    res.end()
  } else {
    //everything else just sends a html response with an audio tag
    res.writeHead(200,{'Content-Type': 'text/html'})
    res.write('<!DOCTYPE html>')
    res.write('<html>')
    res.write('<head>')
    res.write('<title>Simple MIC Stream</title>')
    res.write('</head>')
    res.write('<body>')
      res.write('<audio src="/audio.wav" preload="none" controls > ')
      res.write('</audio>')
    res.write('</body>')
    res.write('</html>')
    res.end()
  }
    
  
  
}).listen(PORT)

console.log('Server started on port ' + PORT)
