
class Point {
    constructor(lat, long, time) {
      this.pos = { lat: lat, lng: long };
      this.timestamp = time;
    }
  }
  
  
  var svgMarker = null;
  var lineSymbol = null;
  
  var slideMarker;
  
  var map = null;
  var polyline = null;
  
  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: {lat: 0, lng: 0},
      mapTypeId: "terrain",
    });
  
    svgMarker = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "red",
      fillOpacity: 1,
      strokeWeight: 1,
      rotation: 0,
      scale: 4,
    };
  
      
    polyline = new google.maps.Polyline({
      map: map,
    });
  
    addFile("skiing.gpx");
  }
  
  
  function parseGPX(gpxString){
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
     } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
     }

     xmlhttp.open("GET", "gps/"+gpxString, false);
     xmlhttp.send();
     xml = xmlhttp.responseXML;

    const errorNode = xml.querySelector("parsererror");
    if (errorNode) {
        console.log("error while parsing");
        return;
    } 
    
    const gpxPoints = xml.documentElement.getRootNode().getElementsByTagName("gpx")[0].getElementsByTagName("trk")[0].getElementsByTagName("trkseg")[0].getElementsByTagName("trkpt")
    
    const points = Array.from(gpxPoints).map((node) => {
        return new Point(Number(node.getAttribute("lat")), Number(node.getAttribute("lon")), new Date(node.getElementsByTagName("time")[0].innerHTML));
    })
    return points;
  }
  
  
  
  function addPoint(point, polyline) {
    const path = polyline.getPath();
    path.push(new google.maps.LatLng(point.pos.lat, point.pos.lng));  
  }
  
  function addFile(gpxFile) {
    let points = parseGPX(gpxFile);
    addPointsToMap(points);
  }
  
  function addPointsToMap(points) {
    if (!(points instanceof Array)) return;
    
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });
  
    slideMarker = new google.maps.Marker({
      position: points[0].pos,
      map: map,
      icon: svgMarker,
    });
  
    slideMarker.addListener("click", () => {
        infoWindow.setContent(//"<h2>"+point.label+"</h2>"+
                                "<p>Location: "+ slideMarker.getPosition().lat() +"&deg;N, " + slideMarker.getPosition().lng() + "&deg;E</p>"/*+
                                "<p>Timestamp: "+point.timestamp.toLocaleTimeString() + " " + point.timestamp.toDateString() + "</p>"*/);
        infoWindow.open(map, slideMarker);
    });
    
  
    
  
    //   return marker;
    // });
  
    const path = polyline.getPath();
    points.forEach((point) => {path.push( new google.maps.LatLng(point.pos.lat, point.pos.lng))});
    map.panTo(path.getAt(0));
  }
  
  function zoomToCoords(lat, long) {
    map.panTo(new google.maps.LatLng(lat, long));
  }
  
  function updateMarkerPos(percent) {
    let point = Math.floor((polyline.getPath().length - 1) / 100 * percent);
    point = polyline.getPath().getAt(point);
    slideMarker.setPosition(point);
    map.panTo(point);
  }