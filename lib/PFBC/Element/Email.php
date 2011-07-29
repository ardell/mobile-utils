<?php
class Element_Email extends Element_Textbox {
	public function render() {
		$this->validation[] = new Validation_Email;
		parent::render();
	}
}
