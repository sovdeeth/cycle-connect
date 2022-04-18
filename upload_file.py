host = 'ec2-3-231-254-204.compute-1.amazonaws.com'
port = 5432
database = 'd3rtf16stnksgb'
user = 'ixanmswvvikzgc'
password = '02b2f4dae35ac0cd1d5eafdb9d05a63edd2dd8d39b94fa3743d5fb2b4b608506'

from sqlalchemy import *

connection = f'postgresql://{user}:{password}@{host}/{database}'
engine = create_engine(connection)
conn = engine.connect()
metadata = MetaData()

table = Table('trackers', metadata, 
    Column('id', Integer, primary_key=True),
    Column('asset_type', String(20), nullable=False),
    Column('firstName', String(20), nullable=False),
    Column('surName', String(20), nullable=False),
    Column('farmID', Integer, nullable=False),
    Column('file', LargeBinary, nullable=True))

metadata.create_all(engine)
query = insert(table).values(id=14, asset_type='bike', firstName='ethan', surName='sovde', farmID=22, file=open('tracking/gps/skiing.gpx', 'rb').read())
result = conn.execute(query)