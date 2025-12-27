<?php
$x = intval($_GET['x']);
$y = intval($_GET['y']);
$z = intval($_GET['z']);
$r = strip_tags($_GET['r']);
if(empty($r)) $r="mapnik";
$server = array();
switch ($r) {
    case 'mapnik':
        $server[] = 'a.tile.openstreetmap.org';
        $server[] = 'b.tile.openstreetmap.org';
        $server[] = 'c.tile.openstreetmap.org';

        $url = 'http://' . $server[array_rand($server)];
        $url .= "/" . $z . "/" . $x . "/" . $y . ".png";
        break;

    case 'osma':
    default:
        $server[] = 'a.tah.openstreetmap.org';
        $server[] = 'b.tah.openstreetmap.org';
        $server[] = 'c.tah.openstreetmap.org';

        $url = 'http://' . $server[array_rand($server)] . '/Tiles/tile.php';
        $url .= "/" . $z . "/" . $x . "/" . $y . ".png";
        break;
}

$ch = curl_init();
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
curl_close($ch);
echo $res;