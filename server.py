import os
import logging
import gevent
from flask import Flask, render_template, request
from flask_sockets import Sockets


app = Flask(__name__)
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)


@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    print data['context']['ip']
    return data['context']['ip']
