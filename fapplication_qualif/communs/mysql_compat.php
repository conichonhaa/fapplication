<?php
/**
 * Compatibilité mysql_* → mysqli
 * Pour applications legacy PHP 5 → PHP 8
 */

if (!function_exists('mysql_query')) {

    // Mémorise la dernière connexion utilisée, pour les appels sans $link
    // (mysql_insert_id() sans argument, comme l'ancienne extension mysql_*)
    function _mysql_compat_link($link = null) {
        static $last = null;
        if ($link instanceof mysqli) $last = $link;
        return $last;
    }

    function mysql_query($query, $link = null) {
        $link = _mysql_compat_link($link);
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

    function mysql_insert_id($link = null) {
        $link = _mysql_compat_link($link);
        return $link ? mysqli_insert_id($link) : 0;
    }

    function mysql_select_db($db, $link) {
        _mysql_compat_link($link);
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
