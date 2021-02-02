<?php

$data = $_POST['json'];

$url = 'otazky.json';

$file = fopen($url, 'w');
fwrite($file, $data);
fclose($file);

?>