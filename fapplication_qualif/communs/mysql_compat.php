<?php
/**
 * Compatibilité mysql_* → mysqli
 * Pour applications legacy PHP 5 → PHP 8
 */

if (!function_exists('mysql_query')) {

    function mysql_query($query, $link = null) {
        return mysqli_query($link, $query);
    }

    function mysql_fetch_array($result, $type = MYSQLI_BOTH) {
        return mysqli_fetch_array($result, $type);
    }

    function mysql_fetch_assoc($result) {
        return mysqli_fetch_assoc($result);
    }

    function mysql_fetch_row($result) {
        return mysqli_fetch_row($result);
    }

    function mysql_num_rows($result) {
        return mysqli_num_rows($result);
    }

   // function mysql_insert_id($link = null) {
   //     return mysqli_insert_id($link);
   // }
   function mysql_insert_id($link = null) {
    if ($link instanceof mysqli) {
        return mysqli_insert_id($link);
    }

    global $bp;
    if (isset($bp->conn) && $bp->conn instanceof mysqli) {
        return mysqli_insert_id($bp->conn);
   }

   return 0;
   }


    function mysql_select_db($db, $link) {
        return mysqli_select_db($link, $db);
    }

    function mysql_set_charset($charset, $link) {
        return mysqli_set_charset($link, $charset);
    }

    function mysql_close($link) {
        return mysqli_close($link);
    }

    function mysql_num_fields($result) {
        return mysqli_num_fields($result);
    }

    function mysql_field_flags($result, $field_offset) {
        return '';
    }
}
