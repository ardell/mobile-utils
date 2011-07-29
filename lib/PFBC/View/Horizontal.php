<?php
class View_Horizontal extends View {
	protected $labelPaddingTop;

	public function jQueryDocumentReady() {
		$id = $this->form->getId();
		echo 'jQuery("#', $id, ' .pfbc-element:last").css("margin-right", "0");';
	}

	public function render() {
		echo '<form', $this->form->getAttributes(), '>';
		$this->form->getError()->render();

		$elements = $this->form->getElements();
		$elementSize = sizeof($elements);
		for($e = 0; $e < $elementSize; ++$e) {
			$element = $elements[$e];

			if($element instanceof Element_Hidden || $element instanceof Element_HTMLExternal)
                $element->render();
			else {	
				echo '<div class="pfbc-element">';
				$this->renderLabel($element);
				$element->render();
				echo '</div>';
			}
		}

		echo '<div style="clear: both;"></div></form>';
    }

	public function renderCSS() {
		$id = $this->form->getId();

		parent::renderCSS();
		echo <<<CSS
#$id .pfbc-element { float: left; margin-right: .5em; }
#$id .pfbc-label strong { color: #990000; }
#$id .pfbc-label { float: left; margin-right: .25em; }
CSS;

		if(empty($this->labelPaddingTop) && !in_array("style", $this->form->getPrevent()))
			$this->labelPaddingTop = ".75em";

		if(!empty($this->labelPaddingTop)) {
			if(is_numeric($this->labelPaddingTop))
				$this->labelPaddingTop .= "px";
			echo '#', $id, ' .pfbc-label { padding-top: ', $this->labelPaddingTop, '; }';
		}
	}
}
