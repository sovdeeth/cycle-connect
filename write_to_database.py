host = 'ec2-3-231-254-204.compute-1.amazonaws.com'
port = 5432
database = 'd3rtf16stnksgb'
user = 'ixanmswvvikzgc'
password = '02b2f4dae35ac0cd1d5eafdb9d05a63edd2dd8d39b94fa3743d5fb2b4b608506'

from database import *
from sqlalchemy import *

connection = f'postgresql://{user}:{password}@{host}/{database}'
engine = create_engine(connection)
conn = engine.connect()
metadata = MetaData()

table = Table('trackers', metadata, autoload=True, autoload_with=engine)

def append_data(tracker_id, data_point, timestamp):
    data = get_data(tracker_id)
    gpx_start, gpx_end = data[:-4], data[-4:]
    timestamp = datetime.datetime.utcfromtimestamp(int(timestamp)).strftime('%Y-%m-%dT%H:%M:%SZ')
    gpx_start.extend([f'   <trkpt lat="{data_point[0]}" lon="{data_point[1]}">', '', f'    <time>{timestamp}</time>', '   </trkpt>'])
    gpx_start.extend(gpx_end)
    return gpx_start

def add_data_point(tracker_id, data_point, timestamp):
    query = table.update().\
        values(file=('\\n').join(append_data(tracker_id, data_point, timestamp)).encode('ascii')).\
        where(table.c.id == tracker_id)
    conn.execute(query)