<?php

// default values
$meta = array(
    'viewport' => array(
        'width'         => NULL,
        'initial-scale' => NULL
    )
);
$metaOut = "";

read_persist_meta();
session_start();

/*********** FUNCTIONS ONLY BELOW ************/

require_once dirname(__FILE__) . "/lib/PFBC/Form.php";
require_once dirname(__FILE__) . "/lib/PFBC/Element/HTMLExternal.php";

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
    global $meta;

    $yesNoOptions = array(
        ''    => 'Default',
        'yes' => 'yes',
        'no'  => 'no'
        );

    print "<h2>Meta Tag Control Panel</h2>";

    $form = new Form("MetaTagEditor");
    $form->configure(array(
        "method" => "get",
    )); 

    $form->addElement(new Element_HTMLExternal('<fieldset><legend>viewport</legend>'));
    $form->addElement(new Element_Textbox("width:", "meta.viewport.width", array(
        'description' => "default is 980, any number or device-width"
    )));
    $form->addElement(new Element_Textbox("height:", "meta.viewport.height", array(
        'description' => "default is 980, any number or device-height"
    )));
    $form->addElement(new Element_Textbox("initial-scale:", "meta.viewport.initial-scale"));
    $form->addElement(new Element_Textbox("minimum-scale:", "meta.viewport.minimum-scale"));
    $form->addElement(new Element_Textbox("maximum-scale:", "meta.viewport.maximum-scale"));
    $form->setValues(array(
            "meta.viewport.width" => $meta['viewport']['width'],
            "meta.viewport.height" => $meta['viewport']['height'],
            "meta.viewport.initial-scale" => $meta['viewport']['initial-scale'],
            "meta.viewport.minimum-scale" => $meta['viewport']['minimum-scale'],
            "meta.viewport.maximum-scale" => $meta['viewport']['maximum-scale'],
        ));
    $form->addElement(new Element_Select("user-scalable:", "meta.viewport.user-scalable", $yesNoOptions, array(
            "value" => $meta['viewport']['user-scalable']
        )));
    $form->addElement(new Element_HTMLExternal('</fieldset>'));

    $form->addElement(new Element_HTMLExternal('<fieldset><legend>format-detection</legend>'));
    $form->addElement(new Element_Select("telephone:", "meta.format-detection.telephone", $yesNoOptions, array(
            "value" => $meta['format-detection']['telephone']
        )));
    $form->addElement(new Element_HTMLExternal('</fieldset>'));

    $form->addElement(new Element_Button);
    print $form->render();
}
