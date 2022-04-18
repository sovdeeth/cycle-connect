# SPDX-FileCopyrightText: 2020 Dan Halbert for Adafruit Industries
#
# SPDX-License-Identifier: MIT

# Connect to an "eval()" service over BLE UART.
import datetime
import time
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService

ble = BLERadio()

uart_connection = None
f = open("empty.gpx", "wt")

while True:
    if not uart_connection:
        print("Trying to connect...")
        for adv in ble.start_scan(ProvideServicesAdvertisement):
            print(str(adv) + " | " + str(UARTService in adv.services))
            if UARTService in adv.services:
                print("trying to connect 2")
                uart_connection = ble.connect(adv)
                print("Connected")
                break
        ble.stop_scan()

    if uart_connection and uart_connection.connected:
        uart_service = uart_connection[UARTService]
        line = ""
        while uart_connection.connected:
            line = line + "" + uart_service.readline().decode("utf-8")
            print("raw: " + line)
            points = line.split("|")
            line = ""
            parsedPoints = []
            for point in points:
                if len(point) > 0:
                    if point[0] != "{" or point[-1] != "}":
                        line = line + point
                    else:
                        data = point[1:-1]
                        data = data.split(",")
                        lat = data[0]
                        long = data[1]
                        timestamp = data[2]
                        parsedPoints.append([lat, long, timestamp])
            
            for data_point in parsedPoints:
                timestamp = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
                f.write(f'   <trkpt lat="{data_point[0]}" lon="{data_point[1]}">\n\n    <time>{timestamp}</time>\n   </trkpt>\n')
        
            time.sleep(1)
