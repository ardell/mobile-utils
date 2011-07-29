<?php
class Element_Button extends Element {
	protected $attributes = array("type" => "submit", "value" => "Submit");
	protected $icon;

	public function __construct($value = "", $type = "", array $properties = null) {
		if(!is_array($properties))
			$properties = array();

		if(!empty($value))
			$properties["value"] = $value;
		if(!empty($type))
			$properties["type"] = $type;
			
		parent::__construct("", "", $properties);
	}

	public function jQueryDocumentReady() {
		/*Unless explicitly prevented, jQueryUI's button widget functionality is applied to 
		the each Button element.*/
		if(!in_array("jQueryUIButtons", $this->form->getPrevent())) {
			echo 'jQuery("#', $this->attributes["id"], '").button(';
			/*Any of the jQueryUI framework icons can be added to your buttons via the icon 
			property.  See http://jqueryui.com/themeroller/ for a complete list of available
			icons.*/
			if(!empty($this->icon))
				echo '{ icons: { primary: "ui-icon-', $this->icon, '" } }';
			echo ');';
		}
	}

	public function render() {
		/*The button tag is used instead of input b/c it functions better with jQueryUI's 
		button widget - specifically the icon option.*/
		echo '<button', $this->getAttributes("value"), '>', $this->attributes["value"], '</button>';
	}	
}
