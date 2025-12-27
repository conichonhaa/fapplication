<?php
header("Cache-Control: max-age=86400",false);
header("Expires: 86400",false);
readfile("board.htm");