<?php

$data = $_POST['json'];

$url = $_SERVER['DOCUMENT_ROOT'].'/zip/js/otazky.json';

$file = fopen($url, 'w');
fwrite($file, $data);
fclose($file);


$dir = 'zip/';
$zipname = 'site.zip';


$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($dir),
    RecursiveIteratorIterator::SELF_FIRST
);

$zip = new ZipArchive;
if ($zip -> open($zipname, ZipArchive::CREATE))
{
    foreach ($files as $file) {

        
        if (in_array(substr($file, strrpos($file, '/') + 1), array('.', '..')))
            continue;

        if (is_dir($file))
        {
            $zip -> addEmptyDir(str_replace($dir.'/', '', $file.'/'));
        }
        else if (is_file($file))
        {
            $zip -> addFromString(
                str_replace($dir.'/', '', $file), file_get_contents($file));
        }
    }
    $zip -> close();

}
?>