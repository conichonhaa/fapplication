<?php
// Modèle : copier ce fichier en _connBD.php sur le serveur et renseigner les valeurs.
// _connBD.php est exclu du dépôt (.gitignore) car il contient les identifiants MySQL.
$host = 'localhost';
$user = 'UTILISATEUR_MYSQL';
$pass = 'MOT_DE_PASSE_MYSQL';
$db   = 'NOM_BASE_PROD';

// adaptation du nom de la base
if (isset($isApplicationQualif) && $isApplicationQualif) {
    $db = 'NOM_BASE_QUALIF';
}

// connexion mysqli
$linkFAP = mysqli_connect($host, $user, $pass, $db);
if (!$linkFAP) {
    die("Erreur de connexion MySQL : " . mysqli_connect_error());
}

// définir le charset UTF-8
mysqli_set_charset($linkFAP, "utf8");
