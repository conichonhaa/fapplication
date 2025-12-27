<?php 
include_once('communs/menu.php');
include_once('communs/log.php');
$root = $fap->getAppName();
if ($root=="") $root = "/";
$fallback = "fallback/";
$versionTimeFB = "?v=".intval(time()/3600);
$manifest = "CACHE MANIFEST
# v2".$versionTimeFB." 
".$root.$fallback."fallbackFap.php".$versionTimeFB."
".$root.$fallback."fallbackScript.js".$versionTimeFB."
".$root.$fallback."fallbackStyle.css".$versionTimeFB."
".$root."images/dizzy-face.png
".$root."images/roue.gif
".$root."_getImg.php?img=".$fap->info['img_id']."

FALLBACK:
".$root." ".$root.$fallback."fallbackFap.php".$versionTimeFB."

NETWORK:
*
";
$f = fopen($fallback."manifest".$fap->getId().".appcache",'w');
fwrite($f,$manifest);
fclose($f);
$f = fopen($fallback."local.txt",'w');
fwrite($f,"versionTime::".$versionTimeFB."\n");
fwrite($f,"root::".$root."\n");
fwrite($f,"fallback::".$fallback."\n");
fclose($f);
