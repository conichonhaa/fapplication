<?php

header('Content-Type: application/xml; charset=UTF-8');


$base = __DIR__ . '/../../back-data';


$xml = "<xml>\n";


// ----- Partie DATA -----

$xml .= "  <data>\n";


foreach (glob($base . '/*.json') as $file) {

    $name = basename($file, '.json');


    $jsonContent = file_get_contents($file);

    $jsonContent = trim($jsonContent);


    // Encapsuler le JSON dans CDATA pour que le front puisse parser correctement

    $xml .= "    <{$name}><![CDATA[{$jsonContent}]]></{$name}>\n";

}


$xml .= "  </data>\n";


// ----- Partie VARIABLES -----

$xml .= "  <variables>\n";

foreach ($_GET as $key => $val) {

    // Échapper les caractères spéciaux pour le XML

    $val = htmlspecialchars($val, ENT_QUOTES | ENT_XML1, 'UTF-8');

    $xml .= "    <{$key}>{$val}</{$key}>\n";

}

$xml .= "  </variables>\n";


$xml .= "</xml>\n";


echo $xml;
