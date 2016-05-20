import os
import logging
import gevent
from flask import Flask, render_template, request
from flask_sockets import Sockets
from geoip import geolite2

app = Flask(__name__)
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)
WEBSOCKETS = []

def get_ip_coordinates(ip_address):
    address = geolite2.lookup(ip_address)
    if address is None:
        return (38.000, -97.000)
    else:
        return address.location

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    ip = data['context']['ip']
    lat, lon = get_ip_coordinates(ip)
    for socket in WEBSOCKETS:
        print socket
        print socket.closed
        if not socket.closed:
            socket.send({'lat': lat, 'lon': lon})
    return data['context']['ip']

@sockets.route('/receive')
def receive(websocket):
    print 'Got a connection!'
    websocket.receive()
    WEBSOCKETS.append(websocket)
