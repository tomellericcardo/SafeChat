# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from json import dumps
from SafeChat import *


WEBSERVER = Flask(__name__)
SAFECHAT = SafeChat(g, 'database.db', WEBSERVER)


@WEBSERVER.before_request
def open_database_connection():
    SAFECHAT.open_database_connection()

@WEBSERVER.teardown_request
def close_database_connection(exception):
    SAFECHAT.close_database_connection()


@WEBSERVER.route('/')
@WEBSERVER.route('/login')
def login():
    