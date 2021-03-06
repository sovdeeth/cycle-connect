
class Point {
    constructor(lat, long, time) {
        this.pos = new google.maps.LatLng(lat, long);
        this.timestamp = time;
    }
}

class Tracker {
    constructor(name, points) {
        this.name = name;
        this.map;
        this.fullPoints = points.map((point) => {return new Point(point[0], point[1], point[2])});
        this.points = this.fullPoints.slice()
        this.startMarker = new google.maps.Marker({
            position: this.points[0].pos,
            icon: startMarkerSVG,
        });

        this.endMarker = new google.maps.Marker({
            position: this.points[this.points.length-1].pos,
            icon: endMarkerSVG,
        });

        this.slideMarker = new google.maps.Marker({
            position: this.points[0].pos,
            icon: slideMarkerSVG,
        });

        this.polyline = new google.maps.Polyline();
        let path = this.polyline.getPath();
        this.points.forEach((point) => {
            path.push( point.pos);
        });

        this.infoWindow = new google.maps.InfoWindow({
            content: "",
            disableAutoPan: true,
        });
            
        this.slideMarker.addListener("click", () => {
            this.infoWindow.setContent(//"<h2>"+point.label+"</h2>"+
                                    "<p>Location: "+ this.slideMarker.getPosition().lat() +"&deg;N, " + this.slideMarker.getPosition().lng() + "&deg;E</p>"+
                                    "<p>Timestamp: "+this.points[0].timestamp + "</p>");
            this.infoWindow.open(this.map, this.slideMarker);
        });

        this.startMarker.addListener("click", () => {
            this.infoWindow.setContent(//"<h2>"+point.label+"</h2>"+
                                    "<p>Location: "+ this.startMarker.getPosition().lat() +"&deg;N, " + this.startMarker.getPosition().lng() + "&deg;E</p>"+
                                    "<p>Timestamp: "+this.points[0].timestamp + "</p>");
            this.infoWindow.open(this.map, this.startMarker);
        });

        this.endMarker.addListener("click", () => {
            this.infoWindow.setContent(//"<h2>"+point.label+"</h2>"+
                                    "<p>Location: "+ this.endMarker.getPosition().lat() +"&deg;N, " + this.endMarker.getPosition().lng() + "&deg;E</p>"+
                                    "<p>Timestamp: "+this.points[this.points.length-1].timestamp + "</p>");
            this.infoWindow.open(this.map, this.endMarker);
        });
    }

    addPoints(points){
        let path = this.polyline.getPath();
        points.forEach((point) => {
            path.push( point.pos);
            this.points.push(point);
        });
    }

    getPointAt(index){
        return points[index];
    }

    addToMap(map){
        this.map = map;
        this.startMarker.setMap(map);
        this.endMarker.setMap(map);
        this.slideMarker.setMap(map);
        this.polyline.setMap(map);
    }

    removeFromMap(){
        this.map = null;
        this.startMarker.setMap(null);
        this.endMarker.setMap(null);
        this.slideMarker.setMap(null);
        this.polyline.setMap(null);
    }

    displayFromIndices(a, b){
        this.points = this.fullPoints.slice(a,b);
        this.updateTracker();
    }

    displayFromDates(startTime, endTime) {
        this.points = this.fullPoints.filter((point) => point.timestamp > startTime && point.timestamp < endTime);
        this.updateTracker();
    }

    updateTracker(){
        this.polyline.setPath(this.points.map((point) => {return point.pos}));
        this.startMarker.setPosition(this.points[0].pos);
        this.slideMarker.setPosition(this.points[0].pos);
        this.endMarker.setPosition(this.points[this.points.length - 1].pos);
        updateSlider();
    }
}

var trackers = [];
var selectedTracker = 0;
var startMarkerSVG = null;
var endMarkerSVG = null;
var slideMarkerSVG = null;
var lineSymbol = null;

var map = null;
var polyline = null;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: {lat: 0, lng: 0},
        mapTypeId: "terrain",
    });

    startMarkerSVG = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "green",
        fillOpacity: 1,
        strokeWeight: 1,
        rotation: 0,
        scale: 4,
    };

    slideMarkerSVG = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "yellow",
        fillOpacity: 1,
        strokeWeight: 1,
        rotation: 0,
        scale: 4,
    };

    endMarkerSVG = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 1,
        rotation: 0,
        scale: 4,
    };

    initTrackers();
}

async function initTrackers() {
    trackerList = [[3,400,0],[13,40,0]];

    for (let i = 0; i < trackerList.length; i++) {
        let tracker = await requestTrackerPoints(trackerList[i][0], trackerList[i][1], trackerList[i][2]);
        console.log(tracker);
        registerTracker(tracker[0], tracker[1]);
    }
    // registerTracker("skiing", "skiing.gpx");
    // registerTracker("snowboarding", "snowboarding.gpx");
    // registerTracker("old-river", "old-river.gpx");
    // registerTracker("toronto-run", "toronto-run.gpx");

    for (i=0; i<trackers.length; i++){
        document.getElementById("tracker-list").innerHTML += "<li class=\"tracker\" id=\"tracker-"+i+"\" onclick=\"focusTracker("+i+")\"> Tracker #"+trackers[i].name+" <button class=\"select-tracker\" onclick=\"selectTracker(this, "+i+")\">Select</button></li>";
    }
        
    // trackers[0].addToMap(map);
    // map.panTo(trackers[0].points[0].pos);
    // updateSlider()
}

function registerTracker(name, points) {
    let tracker = new Tracker(name, points);
    trackers.push(tracker);
}


// function requestAllTrackers(startTime, endTime) {
//     // request all trackers
//     return tracker
// }

async function requestTrackerPoints(name, startTime, endTime) {
    const payload = new FormData();
    payload.append("tracker", name);
    payload.append("startTime", startTime);
    payload.append("endTime", endTime);
    const res = await fetch('/tracker-request/', {
        method: 'post',
        body: payload
    });
    let points = await res.json();
    // console.log()
    if (name == 13) points.map((point) => {point[0] -= 0.0073; point[1] = -1 * point[1] + 0.0092; return point;});
    console.log(points);
    return [name, points];
}

// function parseGPX(gpxString){
//     if (window.XMLHttpRequest) {
//         xmlhttp = new XMLHttpRequest();
//     } else {
//         xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }

//     xmlhttp.open("GET", "gps/"+gpxString, false);
//     xmlhttp.send();
//     xml = xmlhttp.responseXML;

//     const errorNode = xml.querySelector("parsererror");
//     if (errorNode) {
//         console.log("error while parsing");
//         return;
//     } 

//     const gpxPoints = xml.documentElement.getRootNode().getElementsByTagName("gpx")[0].getElementsByTagName("trk")[0].getElementsByTagName("trkseg")[0].getElementsByTagName("trkpt")

//     const points = Array.from(gpxPoints).map((node) => {
//         return new Point(Number(node.getAttribute("lat")), Number(node.getAttribute("lon")), new Date(node.getElementsByTagName("time")[0].innerHTML));
//     })
//     return points;
// }


function updateSlider(){
    let slider = document.getElementById("trackerSlider");
    let min = 0, max = trackers[selectedTracker].points.length;
    slider.setAttribute("min", min)
    slider.setAttribute("max", max)
}

function updateMarkerPos(pointIndex) {
    point = trackers[selectedTracker].polyline.getPath().getAt(pointIndex);
    trackers[selectedTracker].slideMarker.setPosition(point);
    trackers[selectedTracker].infoWindow.setContent(//"<h2>"+point.label+"</h2>"+
                                "<p>Location: "+ trackers[selectedTracker].slideMarker.getPosition().lat() +"&deg;N, " + trackers[selectedTracker].slideMarker.getPosition().lng() + "&deg;E</p>"+
                                "<p>Timestamp: "+trackers[selectedTracker].points[pointIndex].timestamp + "</p>");
    map.panTo(point);
}

function selectTracker(button, number) {
    button.classList.toggle("select-tracker-active");
    if (button.classList.contains("select-tracker-active")) {
        trackers[number].addToMap(map);
    } else {
        trackers[number].removeFromMap();
    }
}

function focusTracker(number) {
    if (trackers[number].map != null){
        selectedTracker = number;
        updateSlider();
        map.panTo(trackers[number].points[0].pos);
    }
}