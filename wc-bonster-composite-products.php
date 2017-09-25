<?php
/*
* Plugin Name: WooCommerce Bonster Composite Products
* Plugin URI: http://bonster.com.co
* Description: Create complex, configurable product kits and let your customers build their own, personalized versions.
* Version: 1.0.0
* Author: Bonster SAS
* Author URI: http://bonster.com.co
* Developer: jgarcia
* Developer URI: https://www.facebook.com/jmillos13
*
* Text Domain: wc-bonster-composite-products
* Domain Path: /languages/
*
* Requires at least: 3.8
* Tested up to: 4.6
*
* Copyright: © 2016 Bonster SAS.
* License: GNU General Public License v3.0
* License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check if WooCommerce is active.
if ( !in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
	return;
}

class WC_Bonster_Composite_Products {
	public static $loadCDN = false;
	public static $cssAssets;
	public static $jsAssets;
	public $version = "0.0.0";	

	public function __construct(){
		add_action( 'plugins_loaded', array($this, 'wc_bonster_plugins_loaded') );

		self::$cssAssets = array(
			array(
				'key' => 'angular-material-css',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.css':$this->wc_bonster_plugin_url()."/assets/vendors/angular-material.min.css",
				'deps' => false,
				'ver' => '1.1.0',
				'type' => 'all'
			)
		);

		self::$jsAssets = array(
			'angularjs-package' => array(
				'key' => 'angularjs-package',
				'src' => $this->wc_bonster_plugin_url()."/assets/js/angular-package.min.js",
				'deps' => array('jquery'),
				'ver' => '1.5.7',
			),
			'angularjs-material-package' => array(
				'key' => 'angularjs-material-package',
				'src' => $this->wc_bonster_plugin_url()."/assets/js/angular-material-package.min.js",
				'deps' => array(),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angularjs',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular.min.js",
				'deps' => array('jquery'),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angular-sanitize',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-sanitize.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular-sanitize.min.js",
				'deps' => array('angularjs'),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angular-animate',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular-animate.min.js",
				'deps' => array('angularjs'),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angular-aria',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-aria.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular-aria.min.js",
				'deps' => array('angularjs'),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angular-messages',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-messages.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular-messages.min.js",
				'deps' => array('angularjs'),
				'ver' => '1.5.7',
			),
			array(
				'key' => 'angular-material',
				'src' => self::$loadCDN ? 'http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.js':$this->wc_bonster_plugin_url()."/assets/vendors/angular-material.min.js",
				'deps' => array('angularjs'),
				'ver' => '1.1.0',
			)
		);
	}

	public function wc_bonster_plugin_url() {
		return plugins_url( basename( plugin_dir_path(__FILE__) ), basename( __FILE__ ) );
	}

	public function min_decimal($val) {
	    return 0.001;
	}

	// Add step value to the quantity field (default = 1)
	public function allow_decimal($val) {
	    return 0.001;
	}

	public function wc_bonster_plugins_loaded() {
		add_filter('woocommerce_quantity_input_min', array($this, 'min_decimal'));
		add_filter('woocommerce_quantity_input_step', array($this, 'allow_decimal'));

		// Add unit price fix when showing the unit price on processed orders
		add_filter('woocommerce_order_amount_item_total', array($this, 'unit_price_fix'), 10, 5);
		add_filter( 'woocommerce_quantity_input_pattern', array($this, 'wc_bonster_quantity_input_pattern'), 10, 1 );

		// Remove intval restriction, we'll allow decimals
		remove_filter( 'woocommerce_stock_amount', 'intval' );

		// allow decimal floats
		add_filter( 'woocommerce_stock_amount', 'floatval' );	
	}
	
	public function unit_price_fix($price, $order, $item, $inc_tax = false, $round = true) {
	    $qty = (!empty($item['qty']) && $item['qty'] != 0) ? $item['qty'] : 1;
	    if($inc_tax) {
	        $price = ($item['line_total'] + $item['line_tax']) / $qty;
	    } else {
	        $price = $item['line_total'] / $qty;
	    }
	    $price = $round ? round( $price, 2 ) : $price;
	    return $price;
	}

	public function wc_bonster_quantity_input_pattern($pattern){
		return '/^-?(?:\d+|\d*\.\d+)$/'; //'[0-9]+([\.,][0-9]+)?';
	}
}
$GLOBALS['WC_Bonster_Composite_Products'] = new WC_Bonster_Composite_Products();

require_once("includes/post-types/composition.php");
require_once("includes/woocommerce/class-wc-admin.php");
require_once("includes/woocommerce/class-wc-product.php");