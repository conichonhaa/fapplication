<?php
$host = 'localhost';
$user = 'fapuser';            // utilisateur MySQL dédié
$pass = 'XXXXXXXXXX';     // mot de passe MySQL
$db   = 'fapbase';

// adaptation du nom de la base
if (isset($isApplicationQualif) && $isApplicationQualif) {
    $db = '_qualif';
}

// connexion mysqli
$linkFAP = mysqli_connect($host, $user, $pass, $db);
if (!$linkFAP) {
    die("Erreur de connexion à la base : " . mysqli_connect_error());
}

// définir le charset UTF-8
mysqli_set_charset($linkFAP, "utf8");
