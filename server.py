import json
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
    return render_template('index.html')

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    print(data)
    ip = data['context']['ip']
    lat, lon = get_ip_coordinates(ip)
    for socket in WEBSOCKETS:
        if not socket.closed:
            socket.send(json.dumps({'lat': lat, 'lon': lon}))
    return data['context']['ip']

@sockets.route('/receive')
def receive(websocket):
    WEBSOCKETS.append(websocket)
    websocket.receive()
