<?php require_once "meta.php"; ?>
<html>
<head>
<title>Sizing Tester</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.js"></script>
<?php output_meta(); ?>
<style type="text/css">
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
#contents {
  position: absolute;
  top: 100px;
  left: 100px;
  font-size: 12px;
}
#contents table {
  font-size: 12px;
  margin: 0 0 10px 0;
  padding: 0;
}
#contents table tr, #contents table tr td {
  margin: 0;
  padding: 0;
}
label {
  width: 12em;
  display: inline-block;
}
ul {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
li {
  width: 30px;
  height: 30px;
  vertical-align: top;
}
li.description {
  position: absolute;
  color: rgba(0, 0, 0, 0.5);
}
.wide .description {
  width: 200px !important;
  top: 0;
  left: 100px;
  line-height: 30px;
}
.tall .description {
  text-align: center;
  top: 100px;
  left: 0px;
}
.tall {
  width: 30px;
}
.wide {
  height: 30px;
}
.pixels.tall {
  left: 0px;
}
.ems.tall {
  left: 30px;
}
.inches.tall {
  left: 60px;
}
.pixels.wide {
  top: 0;
}
.ems.wide {
  top: 30px;
}
.inches.wide {
  top: 60px;
}
.tall li {
  display: block;
}
.wide li {
  display: inline-block;
}
.pixels.tall li {
  height: 1px;
}
.pixels.wide li {
  width: 1px;
}
.pixels li.increment-5 {
  background-color: rgba(255, 0, 0, 0.25);
}
.tall.pixels li.increment-5 {
  width: 5px;
}
.wide.pixels li.increment-5 {
  height: 5px;
}
.pixels li.increment-10 {
  background-color: rgba(255, 0, 0, 0.5);
}
.tall.pixels li.increment-10 {
  width: 10px;
}
.wide.pixels li.increment-10 {
  height: 10px;
}
.pixels li.increment-100 {
  background-color: rgba(255, 0, 0, 1.0);
}
.tall.pixels li.increment-100 {
  width: 30px !important;
}
.wide.pixels li.increment-100 {
  height: 30px !important;
}
.ems.tall li {
  height: 1em;
}
.ems.wide li {
  width: 1em;
}
.ems li.increment-2 {
  background-color: rgba(0, 255, 0, 0.5);
}
.inches.tall li {
  height: 1in;
}
.inches.wide li {
  width: 1in;
}
.inches li.increment-2 {
  background-color: rgba(0, 0, 255, 0.5);
}
</style>
</head>
<body>

<ul class="tall pixels">
  <li class="description">px</li>
</ul>
<ul class="tall ems">
  <li class="description">em</li>
</ul>
<ul class="tall inches">
  <li class="description">in</li>
</ul>

<ul class="wide pixels">
  <li class="description">px</li>
</ul>
<ul class="wide ems">
  <li class="description">em</li>
</ul>
<ul class="wide inches">
  <li class="description">in</li>
</ul>

<div id="contents">
  <div id="info"></div>

  <div id="control-panel">
    <?php display_meta_control_panel(); ?>
  </div>
</div>

<script>
jQuery(document).ready(function() {
  // Pixels
  var pixelsTall = $('.pixels.tall');
  var pixelsWide = $('.pixels.wide');
  for (var i = 1; i < 1400; i++) {
    var block = $('<li></li>');
    if (i % 5   == 0) block.addClass('increment-5');
    if (i % 10  == 0) block.addClass('increment-10');
    if (i % 25  == 0) block.addClass('increment-25');
    if (i % 50  == 0) block.addClass('increment-50');
    if (i % 100 == 0) block.addClass('increment-100');
    if (i % 250 == 0) block.addClass('increment-250');
    if (i % 500 == 0) block.addClass('increment-500');
    pixelsTall.append(block);
    pixelsWide.append(block.clone());
  }

  // Ems
  var emsTall = $('.ems.tall');
  var emsWide = $('.ems.wide');
  for (var i = 1; i < 100; i++) {
    var block = $('<li></li>');
    if (i % 1  == 0) block.addClass('increment-1');
    if (i % 2  == 0) block.addClass('increment-2');
    if (i % 5  == 0) block.addClass('increment-5');
    if (i % 10 == 0) block.addClass('increment-10');
    if (i % 25 == 0) block.addClass('increment-25');
    emsTall.append(block);
    emsWide.append(block.clone());
  }

  // Inches
  for (var i = 1; i < 14; i++) {
    var block = $('<li></li>');
    if (i % 1  == 0) block.addClass('increment-1');
    if (i % 2  == 0) block.addClass('increment-2');
    if (i % 5  == 0) block.addClass('increment-5');
    if (i % 10 == 0) block.addClass('increment-10');
    $('.inches.tall').append(block);
    $('.inches.wide').append(block.clone());
  }

  // Info
  var infoElement = $('#info');
  var infos = [
    { key: '$(document).height()', width: $(document).width(),       height: $(document).height()       },
    { key: '$(window).height()',   width: $(window).width(),         height: $(window).height()         },
    { key: 'window.innerHeight',   width: window.innerWidth,         height: window.innerHeight         },
    { key: 'window.outerHeight',   width: window.outerWidth,         height: window.outerHeight         },
    { key: 'body.clientHeight',    width: document.body.clientWidth, height: document.body.clientHeight },
    { key: 'screen.height',        width: screen.width,              height: screen.height              },
    { key: 'screen.availHeight',   width: screen.availWidth,         height: screen.availHeight         }
  ];
  var tableElement = $('<table></table>');
  tableElement.append($('<tr><th>Property</th><th>Width</th><th>Height</th></tr>'));
  $(infos).each(function(i, info) {
    tableElement.append($('<tr><td>' + info.key + '</td><td>' + info.width + '</td><td>' + info.height + '</td></tr>'));
  });
  infoElement.append(tableElement);
  infoElement.append($('<div><label>window.devicePixelRatio</label>' + window.devicePixelRatio + "</div>"));
});
</script>
</body>
</html>