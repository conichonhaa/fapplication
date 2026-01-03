<?php
$file = "local.txt";
$f = fopen($file,'r');
$tt = explode("\n",fread($f,filesize($file)));
$t_local =array();
foreach ($tt as $l) {
	$t = explode("::",$l);
	if (count($t)>1) $t_local[$t[0]] = $t[1];
}	
echo "
<html>
<head>
<title>FAPplication</title>
<meta http-equiv='Content-Type' content='text/html;charset=utf-8' />
<meta http-equiv='content-language' content='fr-FR' />
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link rel='shortcut icon' type='image/x-icon' href='".$t_local['root']."images/fap.ico' >
<script type='text/javascript' src='".$t_local['root'].$t_local['fallback']."fallbackScript.js".$t_local['versionTime']."'></script>
<link rel='stylesheet' href='".$t_local['root'].$t_local['fallback']."fallbackStyle.css".$t_local['versionTime']."' media='all' type='text/css' />
</head>
<body>

<div class='bandeau'>
<img id='menuAvatar' src='' align='center' class='imgAvatar' />
<span id='menuLogin' >Hors Ligne</span>
</div>
<div class='divMessage divMessMini'>&nbsp; dernière connexion le ".strftime("%d/%m/%Y à %Hh%M",time())."</div>

<div id='offAlert' class='divMessage'></div>

<div class='cadre'>

<div style='display:none;' >
<img src='".$t_local['root']."images/dizzy-face.png' />
<img src='".$t_local['root']."images/roue.gif' />
</div>

<div id='divFap' style='display:none;'>
	<div><i>Enregistre ton Fap il sera synchronisé à ta prochaine connexion...</i><br><br></div>
	<div class='blocDisplay' ><div id='aFappe' class='buttFap' onclick='aFappeWait(this);' >J'ai Fappé</div></div>
</div>
<div class='divMessage' id='divErrFap'></div>

<script type='text/javascript' >var root='".$t_local['root']."'; getInfoStorage()</script>
</body>
</html>
";
