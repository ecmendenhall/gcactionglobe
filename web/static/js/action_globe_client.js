import planetaryjs from 'planetary.js';
import topojson from 'topojson';
import socket from './socket';

const stream = require('getstream/dist/js/getstream.js');

export function counter() {
  var actions_taken = 7369591;
  $('#actionsTaken').text(actions_taken.toLocaleString());

  let action_channel = socket.channel("activity:action", {})
  action_channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  action_channel.on("new_msg", function (data) {
    actions_taken += 1;
    console.log('Actions taken: ', actions_taken);
    $('#actionsTaken').text(actions_taken.toLocaleString());
  });
}

export function feed() {
  let stream_client = stream.connect('3x7pjebvreba', null, '2216');
  let feed = stream_client.feed('action', 'all', 'cN1A9ruNVfksbLfPSK_JdnKE2yw');
  feed.subscribe(
    (data) => {
      data.new.forEach(
        (activity) => {
          console.log(activity);
          let item = $(`
            <li class="animated fadeInDown">
              <img src="https://static-qa.globalcitizen.org/static/img/action_icon_${ activity.type }.svg">
              <a href="${ activity.action_url }">${ activity.action_title }</a>
            </li>`);
          $('#activityFeed').prepend(item);
          $('#activityFeed > li').slice(10).remove();
        }
      )
    }
  ).then(
    () => { console.log('Connected to Stream successfully'); },
    (data) => { console.log('Unable to connect to stream', data); }
  );
}

export function globe() {
  let activity_channel = socket.channel("activity:*", {})
  activity_channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  document.onreadystatechange = function() {
    let height = window.innerHeight;
    let width = window.innerWidth;
    var globe = planetaryjs.planet();
    // Load our custom `autorotate` plugin; see below.
    globe.loadPlugin(autorotate(1.618 * 5));
    // The `earth` plugin draws the oceans and the land; it's actually
    // a combination of several separate built-in plugins.
    //
    // Note that we're loading a special TopoJSON file
    // (world-110m-withlakes.json) so we can render lakes.
    globe.loadPlugin(planetaryjs.plugins.earth({
      topojson: { file:   '/json/world-110m-withlakes.json' },
      oceans:   { fill:   'rgba(40,40,40,0.85)' },
      land:     { fill:   'rgba(255,255,255,0.1)' },
      borders:  { stroke: 'rgba(255,255,255,0)' }
    }));
    // Load our custom `lakes` plugin to draw lakes; see below.
    globe.loadPlugin(lakes({
      fill: 'rgba(255,255,255,0.1)'
    }));
    // The `pings` plugin draws animated pings on the globe.
    globe.loadPlugin(planetaryjs.plugins.pings());
    // The `zoom` and `drag` plugins enable
    // manipulating the globe with the mouse.
    globe.loadPlugin(planetaryjs.plugins.zoom({
      scaleExtent: [100, height * 1.25]
    }));
    globe.loadPlugin(planetaryjs.plugins.drag({
      // Dragging the globe should pause the
      // automatic rotation until we release the mouse.
      onDragStart: function() {
        this.plugins.autorotate.pause();
      },
      onDragEnd: function() {
        this.plugins.autorotate.resume();
      }
    }));
    // Set up the globe's initial scale, offset, and rotation.
    globe.projection.scale(height *  0.48).translate([0.65 * width, 0.5 * height]).rotate([0, -15, 0]);

    activity_channel.on("new_msg", function (data) {
      for (var count = 0; count < 5; count++) {
        globe.plugins.pings.add(data.lon, data.lat, { color: '#d62027', ttl: 2000, angle: Math.random() * 10 });
      }
    });

    var canvas = document.getElementById('rotatingGlobe');
    var context = canvas.getContext('2d');
    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;
    console.log(context.canvas.width);
    console.log(context.canvas.height);
    globe.draw(canvas);

    // This plugin will automatically rotate the globe around its vertical
    // axis a configured number of degrees every second.
    function autorotate(degPerSec) {
      // Planetary.js plugins are functions that take a `planet` instance
      // as an argument...
      return function(planet) {
        var lastTick = null;
        var paused = false;
        planet.plugins.autorotate = {
          pause:  function() { paused = true;  },
          resume: function() { paused = false; }
        };
        // ...and configure hooks into certain pieces of its lifecycle.
        planet.onDraw(function() {
          if (paused || !lastTick) {
            lastTick = new Date();
          } else {
            var now = new Date();
            var delta = now - lastTick;
            // This plugin uses the built-in projection (provided by D3)
            // to rotate the globe each time we draw it.
            var rotation = planet.projection.rotate();
            rotation[0] += degPerSec * delta / 1000;
            if (rotation[0] >= 180) rotation[0] -= 360;
            planet.projection.rotate(rotation);
            lastTick = now;
          }
        });
      };
    }

    // This plugin takes lake data from the special
    // TopoJSON we're loading and draws them on the map.
    function lakes(options) {
      options = options || {};
      var lakes = null;

      return function(planet) {
        planet.onInit(function() {
          // We can access the data loaded from the TopoJSON plugin
          // on its namespace on `planet.plugins`. We're loading a custom
          // TopoJSON file with an object called "ne_110m_lakes".
          var world = planet.plugins.topojson.world;
          lakes = topojson.feature(world, world.objects.ne_110m_lakes);
        });

        planet.onDraw(function() {
          planet.withSavedContext(function(context) {
            context.beginPath();
            planet.path.context(context)(lakes);
            context.fillStyle = options.fill || 'black';
            context.fill();
          });
        });
      };
    }
  };
}
