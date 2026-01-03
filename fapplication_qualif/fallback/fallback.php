<?php
if (isset($_GET['usr'])) $usr = $_GET['usr']; else $usr="";
echo "<html manifest='manifest".$usr.".appcache'>
<head></head>
<body>fallback</body>
</html>";
