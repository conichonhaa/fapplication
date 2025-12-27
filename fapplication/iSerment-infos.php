<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Le serment d'Hyppofap";
$string .= "</div>";

$string .= "<div>
Je jure par Baccus-Dyonisus, par Priapus son fils, par Anaitis Yarilo et Bes, par tous les dieux et toutes les déesses, les prenant à témoin que je remplirai, suivant mes forces et ma capacité, le serment et l'engagement suivants :
<br><br>
Je mettrai mon maître Fapesh au même rang que les fappeurs de mes jours, je partagerai avec lui mon savoir et, le cas échéant, je pourvoirai à ses besoins. Je tiendrai ses enfants pour des frères, et, s'ils désirent découvrir la luxure, je la leur enseignerai et les parrainerai à la fapplication. Je ferai part de toutes mes expériences, bonnes ou mauvaises, à toute la communauté de disciples liés par engagement et un serment suivant la loi du fap, mais à nul autre.
<br><br>
Je passerai ma vie à fapper et j'exercerai mon art dans l'innocence, la pureté et le respect de l'environnement.
<br>
Dans quelque maison que j'entre, j'y entrerai pour fapper comme un malade, me préservant de tout méfait volontaire et corrupteur, et surtout de la séduction des femmes et des garçons, libres ou esclaves.
<br><br>
Quoi que je voie ou entende dans les cabinets, je tairai ce qui n'a jamais besoin d'être divulgué, regardant la discrétion comme un devoir en pareil cas.
<br><br>
Si je remplis ce serment sans l'enfreindre, qu'il me soit donné de jouir heureusement toute la vie, si je le viole et que je me parjure, qu'on me coupe le zizi !
</div>";


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;
