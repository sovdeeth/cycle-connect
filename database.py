host = 'ec2-3-231-254-204.compute-1.amazonaws.com'
port = 5432
database = 'd3rtf16stnksgb'
user = 'ixanmswvvikzgc'
password = '02b2f4dae35ac0cd1d5eafdb9d05a63edd2dd8d39b94fa3743d5fb2b4b608506'

import datetime
from sqlalchemy import *
from flask import Flask, jsonify

app = Flask(__name__)

connection = f'postgresql://{user}:{password}@{host}/{database}'
engine = create_engine(connection)
conn = engine.connect()
metadata = MetaData()

trackers = Table('trackers', metadata, autoload=True, autoload_with=engine)

def get_data(tracker_id):
    query = select([trackers]).where(trackers.c.id==tracker_id)
    result = conn.execute(query)
    rows = result.fetchall()
    return str(rows[-1][-1]).split('\\n')

def read_data(file, start_date, end_date):
    gpx = file[9:]
    data_points = []
    current_date = datetime.date.today()
    for i in range(2, len(gpx)-2, 4):
        timestamp = gpx[i][10:-17]
        timestamp = timestamp.strip('T')
        timestamp = datetime.datetime.strptime(timestamp, "%Y-%m-%d").date()
        if current_date - datetime.timedelta(days=start_date) <= timestamp:
            point = [float(i) for i in gpx[i-2][15:-3].split('" lon="')]
            point.append(timestamp)
            data_points.append(point)
        elif current_date - datetime.timedelta(days=end_date) > timestamp:
            break
    with app.app_context():
        return jsonify(data_points)

def gpx_points(tracker_id, start_date, end_date):
    file = get_data(tracker_id)
    return read_data(file, int(start_date), int(end_date))