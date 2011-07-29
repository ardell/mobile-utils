<?php
class Element_Checksort extends Element_Sort {
	protected $attributes = array("type" => "checkbox");
	protected $inline;
	protected $maxheight;

	public function jQueryDocumentReady() {
		parent::jQueryDocumentReady();	
		if(!empty($this->inline))
			echo 'jQuery("#', $this->attributes["id"], ' .pfbc-checkbox:last").css("margin-right", "0");';
		else	
			echo 'jQuery("#', $this->attributes["id"], ' .pfbc-checkbox:last").css({ "padding-bottom": "0", "border-bottom": "none" });';

		if(!empty($this->maxheight) && is_numeric($this->maxheight)) {
			echo <<<JS
var checkboxes = jQuery("#{$this->attributes["id"]} .pfbc-checkboxes");
if(checkboxes.outerHeight() > {$this->maxheight}) {
	checkboxes.css({ 
		"height": "{$this->maxheight}px", 
		"overflow": "auto", 
		"overflow-x": "hidden" 
	});
}	
JS;
		}	
	}
	
	public function render() { 
		if(isset($this->attributes["value"])) {
			if(!is_array($this->attributes["value"]))
				$this->attributes["value"] = array($this->attributes["value"]);
		}
		else
			$this->attributes["value"] = array();

		if(substr($this->attributes["name"], -2) != "[]")
			$this->attributes["name"] .= "[]";
		
		$count = 0;
		$existing = "";
		echo '<div id="', $this->attributes["id"], '"><div class="pfbc-checkboxes">';
		foreach($this->options as $value => $text) {
			$value = $this->getOptionValue($value);
			echo '<div class="pfbc-checkbox"><table cellpadding="0" cellspacing="0"><tr><td valign="top"><input id="', $this->attributes["id"], "-", $count, '"', $this->getAttributes(array("id", "value", "checked", "name", "onclick")), ' value="', $this->filter($value), '"';
			if(in_array($value, $this->attributes["value"]))
				echo ' checked="checked"';
			echo ' onclick="updateChecksort(this, \'', $this->filter($text), '\');"/></td><td><label for="', $this->attributes["id"], "-", $count, '">', $text, '</label></td></tr></table></div>';

			if(in_array($value, $this->attributes["value"]))
				$existing .= '<li id="' . $this->attributes["id"] . "-sort-" . $count . '" class="ui-state-default"><input type="hidden" name="' . $this->attributes["name"] . '" value="' . $value . '"/>' . $text . '</li>';

			++$count;
		}	
		echo '</div>';

		if(!empty($this->inline))
			echo '<div style="clear: both;"></div>';

		echo '<ul>', $existing, '</ul></div>';
	}

	function renderJS() {
		echo <<<JS
if(typeof updateChecksort != "function") {		
	function updateChecksort(element, text) {
		var position = element.id.lastIndexOf("-");
		var id = element.id.substr(0, position);
		var index = element.id.substr(position + 1);
		if(element.checked)
			jQuery("#" + id + " ul").append('<li id="' + id + '-sort-' + index + '" class="ui-state-default"><input type="hidden" name="{$this->attributes["name"]}" value="' + element.value + '"/>' + text + '</li>');
		else
			jQuery("#" + id + "-sort-" + index).remove();
	}
}
JS;
	}

	function renderCSS() {
		if(!empty($this->inline))
			echo '#', $this->attributes["id"], ' .pfbc-checkbox { float: left; margin-right: 0.5em; }';
		else	
			echo '#', $this->attributes["id"], ' .pfbc-checkbox { padding: 0.5em 0; border-bottom: 1px solid #f4f4f4; }';
		parent::renderCSS();
	}
}
