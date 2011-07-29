<?php
class Element_Textbox extends Element {
	protected $attributes = array("type" => "text", "class" => "pfbc-textbox");

	public function jQueryDocumentReady() {
		echo 'jQuery("#', $this->attributes["id"], '").outerWidth(jQuery("#', $this->attributes["id"], '").width());';
	}
}
