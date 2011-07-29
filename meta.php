<?php

$meta = array(
    'viewport' => array(
        'width'         => NULL,
        'initial-scale' => NULL
    )
);
$metaOut = "";

read_persist_meta();

function read_persist_meta()
{
    global $meta, $metaOut;

    // coalesce defaults with GET/POST and COOKIE. GET/POST beats COOKIE.
    // meta.<name>=<value>
    // OR
    // meta.<name>.<subName>=<value>
    $metaSep = '_';
    foreach (array_merge($_COOKIE, $_GET, $_POST) as $k => $v) {
        if (strncmp($k, "meta{$metaSep}", 5) !== 0) continue;

        list($unusedMeta, $chunk1, $chunk2) = explode($metaSep, $k);

        if (is_null($chunk2)) // meta.name=value
        {
            $meta[$chunk1] = $v;
        }
        else        // meta.name.subname=value
        {
            $meta[$chunk1][$chunk2] = $v;
        }
    }

    $metaTags = array();
    foreach ($meta as $name => $data) {
        if (is_array($data))
        {
            $hasSomething = false;
            $content = array();
            foreach ($data as $subName => $value) {
                $cookieName = "meta{$metaSep}{$name}{$metaSep}{$subName}";
                setcookie($cookieName, $value); // will clear automatically

                // don't output NULLs
                if (is_null($value)) continue;

                $hasSomething = true;
                $content[] = "{$subName}={$value}";
            }
            $content = join(',', $content);

            if ($hasSomething)
            {
                $metaTags[] = "<meta name=\"{$name}\" content=\"{$content}\" />";
END;
            }
        }
        else
        {
            $cookieName = "meta{$metaSep}{$name}";
            setcookie($cookieName, $data); // will clear automatically

            if (!is_null($data))
            {
                $metaTags[] = "<meta name=\"{$name}\" content=\"{$data}\" />";
            }
        }
    }

    $metaOut = join("\n", $metaTags);
}

function output_meta()
{
    global $metaOut;
    print "\n{$metaOut}\n";
}


function display_meta_control_panel()
{
    print <<<END
<h2>Meta Tag Control Panel</h2>
<form action="">
    <input type="submit" name="submit" value="Update Meta Tags" />
</form>
END;
}
