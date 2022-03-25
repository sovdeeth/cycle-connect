from flask import Flask, render_template, request
from database import *

app = Flask(__name__, template_folder='tracking')

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/tracker-request/', methods=['POST'])
def data():
  name = request.form['tracker']
  startTime = request.form['startTime']
  endTime = request.form['endTime']
  return gpx_points(name, startTime, endTime)

if __name__ == '__main__':
  app.run(debug=True)