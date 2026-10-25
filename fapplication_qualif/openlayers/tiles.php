<?php
// Relais des tuiles OpenStreetMap pour la carte (OpenLayers).
// OSM n'accepte plus que le HTTPS et exige un User-Agent identifiable :
// https://operations.osmfoundation.org/policies/tiles/

$z = isset($_GET['z']) ? intval($_GET['z']) : -1;
$x = isset($_GET['x']) ? intval($_GET['x']) : -1;
$y = isset($_GET['y']) ? intval($_GET['y']) : -1;

// Coordonnées de tuile valides uniquement
$max = ($z >= 0 && $z <= 19) ? (1 << $z) : 0;
if ($max === 0 || $x < 0 || $y < 0 || $x >= $max || $y >= $max) {
    http_response_code(400);
    exit;
}

// Cache disque (7 jours) pour limiter les appels à OSM
$cacheDir  = sys_get_temp_dir() . '/fap_tiles';
$cacheFile = "$cacheDir/$z-$x-$y.png";
$ttl = 7 * 24 * 3600;

if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
    $img = file_get_contents($cacheFile);
} else {
    $ch = curl_init("https://tile.openstreetmap.org/$z/$x/$y.png");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_USERAGENT      => 'FAPplication/1.0 (+https://fap.brenat-production.fr)',
    ]);
    $img  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $type = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    if ($img === false || $code !== 200 || strpos($type, 'image/') !== 0) {
        // Si OSM est injoignable, on sert l'ancienne tuile en cache si elle existe
        if (is_file($cacheFile)) {
            $img = file_get_contents($cacheFile);
        } else {
            error_log("FAP tiles: $z/$x/$y code=$code type=$type err=" . curl_error($ch));
            http_response_code(502);
            exit;
        }
    } else {
        if (!is_dir($cacheDir)) @mkdir($cacheDir, 0775, true);
        @file_put_contents($cacheFile, $img, LOCK_EX);
    }
}

header('Content-Type: image/png');
header('Cache-Control: public, max-age=604800');
echo $img;
