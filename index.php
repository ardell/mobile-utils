<?php require_once "meta.php"; ?>
<!DOCTYPE html> 
<html> 
    <head> 
        <?php output_meta(); ?>
        <title>Mobile Web App Explorer</title> 
    </head> 
<body> 
<p>This app will help you explore the insane intricacies of cross-mobile-device webapp development.</p>

<ul data-role="listview">
    <li><a href="accelerometer_gyroscope.php">Accelerometer/Gyroscope</a></li>
    <li><a href="sizing.php">Sizing</a></li>
</ul>

<?php display_meta_control_panel(); ?>

</body>
</html>

