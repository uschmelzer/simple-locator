<?php

class WPSL_Shortcode {

	/**
	* Unit of Measurement
	*/
	private $unit;

	/**
	* Shortcode Options
	*/
	public $options;


	public function __construct()
	{
		$this->setUnit();
		add_shortcode('wp_simple_locator', array($this, 'renderView'));
	}


	/**
	* Set the unit of measurement
	*/
	private function setUnit()
	{
		$this->unit = ( get_option('wpsl_measurement_unit') ) ? get_option('wpsl_measurement_unit') : 'miles';
	}


	/**
	* Enqueue the Required Scripts
	*/
	private function enqueueScripts()
	{
		wp_enqueue_script('google-maps');
		wp_enqueue_script('simple-locator');
	}


	/**
	* Shortcode Options
	*/
	private function setOptions($options)
	{
		$this->options = shortcode_atts(array(
			'distances' => '5,10,20,50,100'
		), $options);
	}


	/**
	* Format Distances option as array & return a list of select options
	*/
	private function distanceOptions()
	{
		$this->options['distances'] = explode(',', $this->options['distances']);
		$out = "";
		foreach ( $this->options['distances'] as $distance ){
			if ( !is_numeric($distance) ) continue;
			$out .= '<option value="' . $distance . '">' . $distance . ' ' . $this->unit . '</option>';
		}
		return $out;
	}


	/**
	* The View
	*/
	public function renderView($options)
	{	
		$this->setOptions($options);
		$this->enqueueScripts();
		include( dirname( dirname(__FILE__) ) . '/views/simple-locator-form.php');
		return $output;
	}

}

