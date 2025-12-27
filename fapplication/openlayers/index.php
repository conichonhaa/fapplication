<!DOCTYPE HTML>

<html>
  <head>
    <title>OpenLayers OSM</title>
    <style type="text/css">
      html, body, #basicMap {
          width: 100%;
          height: 100%;
          margin: 0;
      }
    </style>
    <script src="OpenLayers.js"></script>
	<script src="proj4js-combined.js"></script>
<?php
if (isset($_GET['proj'])) $proj=$_GET['proj']; else $proj='900913';
echo '<script src="defs/EPSG'.$proj.'.js"></script>';
?>		
    <script>
      function init() {
	  
<?php
if (isset($_GET['z'])) $z=$_GET['z']; else $z=8;
if (isset($_GET['x'])) $x=$_GET['x']; else $x=7;
if (isset($_GET['y'])) $y=$_GET['y']; else $y=42;
echo "var zoom=".$z.";";
echo "var x=".$x.";";
echo "var y=".$y.";";
echo "var proj='".$proj."';";
?>	  
        var pOrigin = new OpenLayers.Projection("EPSG:"+proj);   
        var pGoogle   = new OpenLayers.Projection("EPSG:900913");
		options = {projection:pOrigin,displayProjection:pOrigin};
        map = new OpenLayers.Map("basicMap",options);
        var mapnik         = new OpenLayers.Layer.OSM(); 
        var position       = new OpenLayers.LonLat(x,y).transform(pOrigin, pGoogle);	  

        map.addLayer(mapnik,options);
        map.setCenter(position, zoom );
		
		var liste = ['OpenLayers_Control_Zoom_5','OpenLayers_Control_ArgParser_6','OpenLayers_Control_Attribution_7'];
		for (var i=0; i<liste.length; i++) {
			var div = document.getElementById(liste[i]);
			if (div) div.parentNode.removeChild(div);
		}
      }
    </script>
  </head>
  <body onload="init();">
    <div id="basicMap"></div>
  </body>
</html>