from flask import Flask, render_template
from database import *

app = Flask(__name__, template_folder='tracking')

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/tracker/<int: tracker_id>/<int: start_date>/<int: end_date>', methods=['POST'])
def data():
  return gpx_points({tracker_id}, {start_id}, {end_date})

if __name__ == '__main__':
  app.run(debug=True)