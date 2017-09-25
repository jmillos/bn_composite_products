<?php 

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WC_Bonster_Woocommerce_Admin {
	public function __construct() {
		add_action( 'plugins_loaded', array($this, 'wc_bonster_plugins_loaded') );
	}

	public function wc_bonster_plugins_loaded(){
		// Admin Assets.
		// add_action( 'admin_enqueue_scripts', array( $this, 'composition_admin_script' ) );

		// Creates the admin Compositions panel tabs.
		add_action( 'woocommerce_product_write_panel_tabs', array( $this, 'composite_write_panel_tabs' ) );

		// Creates the admin Compositions panels.
		add_action( 'woocommerce_product_write_panels', array( $this, 'composite_write_panel' ) );
		// add_action( 'woocommerce_product_options_general_product_data', array( $this, 'wc_bonster_pricing_options' ) );

		// Allows the selection of the 'composite product' type.
		add_filter( 'product_type_selector', array( $this, 'add_composite_type' ) );

		// Processes and saves the necessary post metas from the selections made above.
		add_action( 'woocommerce_process_product_meta_bonscomposite', array( $this, 'process_composite_meta' ) );

		//Ajax Response
		add_action( 'wp_ajax_nopriv_wc_bonster_search_compositions', array($this, 'wc_bonster_search_compositions') );
		add_action( 'wp_ajax_wc_bonster_search_compositions', array($this, 'wc_bonster_search_compositions') );
	}

	public function add_composite_type( $options ) {

		$options[ 'bonscomposite' ] = __( 'Producto Compuesto', 'wc-bonster-composite-products' );

		return $options;
	}

	public function admin_script($elementNgApp){
		global $post_type, $WC_Bonster_Composite_Products;

		// if( 'product' == $post_type ){
	    	// AngularJS Assets
	    	foreach (WC_Bonster_Composite_Products::$cssAssets as $key => $ass) {
		    	wp_register_style( $ass['key'], $ass['src'], $ass['deps'], $ass['ver'], $ass['type'] );
		    	wp_enqueue_style( $ass['key'] );
	    	}

	    	$package = WC_Bonster_Composite_Products::$jsAssets['angularjs-package'];
	    	wp_register_script( $package['key'], $package['src'], $package['deps'], $package['ver'], true );
			wp_enqueue_script( $package['key'] );

	    	$package = WC_Bonster_Composite_Products::$jsAssets['angularjs-material-package'];
	    	wp_register_script( $package['key'], $package['src'], $package['deps'], $package['ver'], true );
			wp_enqueue_script( $package['key'] );

			// Bonster Assets
	    	wp_register_style( 'wc-bonster-composition-css', $WC_Bonster_Composite_Products->wc_bonster_plugin_url()."/assets/css/main.css", array('woocommerce_admin_styles'), $WC_Bonster_Composite_Products->version, 'all' );
	    	wp_enqueue_style( 'wc-bonster-composition-css' );
		    wp_register_script( 'wc_bonster_bundle', $WC_Bonster_Composite_Products->wc_bonster_plugin_url()."/assets/js/bundle.js", array('jquery', 'angularjs-package', 'angularjs-material-package', 'wc-admin-meta-boxes'), $WC_Bonster_Composite_Products->version, true );
		    wp_enqueue_script( 'wc_bonster_bundle' );

		    $params = array(
		    	'ajax_url' => admin_url( 'admin-ajax.php' ),
				'search_compositions_nonce' => wp_create_nonce( 'search-compositions' ),
				'element_ngapp_angularjs' => $elementNgApp,
			);
			wp_localize_script( 'wc_bonster_bundle', 'wc_bonster_admin_meta_boxes', $params );
		// }
	}

	/**
	 * Adds the Composite Product write panel tabs.
	 *
	 * @return string
	 */
	public function composite_write_panel_tabs() {
		echo '<li class="bto_product_tab show_if_bonscomposite linked_product_options bons_composite_product_options"><a href="#bons_composite_data">'.__( 'Composiciones', 'wc-bonster-composite-products' ).'</a></li>';
	}

	/**
	 * Components and Scenarios write panels.
	 *
	 * @return void
	 */
	public function composite_write_panel() {
		global $post;

		$this->admin_script('#woocommerce-product-data');

		$compositionsData = maybe_unserialize( get_post_meta( $post->ID, '_wcb_composition_compositions_data', true ) );

		echo '<div id="bons_composite_data" class="panel woocommerce_options_panel wc-metaboxes-wrapper">
				<composite-woocommerce bons-compositions="' . ( is_array($compositionsData) ? esc_attr(json_encode($compositionsData)):'[]' ) . '"></composite-woocommerce>
			</div>';
	}

	/**
	 * Process, verify and save composite product data.
	 *
	 * @param  int 	$post_id
	 * @return void
	 */
	public function process_composite_meta( $post_id ) {
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			return false;
		}

		global $post, $post_type;

		/*if ( !wp_verify_nonce( $_POST[$meta_box['name'].'_noncename'], plugin_basename(__FILE__) )) {  
			return $post_id;  
		} */
		if( 'product' != $post_type )
			return $post_id;

		if ( !current_user_can( 'edit_post', $post_id ) )  
			return $post_id;

		$fields = array('id', 'name', 'isAdditional');
		$requestCompositionsData = json_decode(stripslashes($_POST['wcBonsterCompositions']), true);
		$compositionsData = array();
		foreach($requestCompositionsData as $cmp) {
			$item = array(); 
			foreach ($cmp as $key => $value) {
				if( in_array($key, $fields) ){
					$item[$key] = $value;
				}
			}
			$compositionsData[] = $item;
			/*if(get_post_meta($post_id, $meta_box['name'].'_value') == "")  
				add_post_meta($post_id, $meta_box['name'].'_value', $data, true);  
			elseif($data != get_post_meta($post_id, $meta_box['name'].'_value', true))  
				update_post_meta($post_id, $meta_box['name'].'_value', $data);  
			elseif($data == "")  
				delete_post_meta($post_id, $meta_box['name'].'_value', get_post_meta($post_id, $meta_box['name'].'_value', true));*/  
		}

		if( is_array($compositionsData) )
			update_post_meta( $post_id, '_wcb_composition_compositions_data', $compositionsData );
	}

	public function wc_bonster_search_compositions() {
		$args = array(
			'numberposts' => 10,
			'post_type'   => 'bonster_composition',
			's' => $_GET['term']
		);
		$compositions = get_posts( $args );
	    echo json_encode($compositions);
	    die();
	}

	/**
	 * Adds the base and sale price option writepanel options
	 * @return void
	 */
	public function wc_bonster_pricing_options() {

		global $thepostid, $post_type;

		echo '<div class="options_group bons_base_pricing show_if_bonscomposite">';

		// Price.
		woocommerce_wp_text_input( array( 'id' => '_regular_price', 'class' => 'short', 'label' => __( 'Regular Price', 'woocommerce' ) . ' (' . get_woocommerce_currency_symbol() . ')', 'data_type' => 'price', 'desc_tip' => true, 'description' => __( 'Base regular/sale price of the Composite, added on top of the regular/sale price of all selected Components.' ) ) );

		// Sale Price.
		woocommerce_wp_text_input( array( 'id' => '_sale_price', 'class' => 'short', 'label' => __( 'Sale Price', 'woocommerce' ) . ' (' . get_woocommerce_currency_symbol() . ')', 'data_type' => 'price', 'description' => '<a href="#" class="sale_schedule">' . __( 'Schedule', 'woocommerce' ) . '</a>' ) );

		// Special Price date range.
		$sale_price_dates_from = ( $date = get_post_meta( $thepostid, '_sale_price_dates_from', true ) ) ? date_i18n( 'Y-m-d', $date ) : '';
		$sale_price_dates_to   = ( $date = get_post_meta( $thepostid, '_sale_price_dates_to', true ) ) ? date_i18n( 'Y-m-d', $date ) : '';

		echo '<p class="form-field sale_price_dates_fields base_sale_price_dates_fields">
			<label for="_sale_price_dates_from">' . __( 'Sale price dates', 'woocommerce' ) . '</label>
			<input type="text" class="short sale_price_dates_from" name="_sale_price_dates_from" id="_sale_price_dates_from" value="' . esc_attr( $sale_price_dates_from ) . '" placeholder="' . _x( 'From&hellip;', 'placeholder', 'woocommerce' ) . ' YYYY-MM-DD" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<input type="text" class="short sale_price_dates_to" name="_sale_price_dates_to" id="_sale_price_dates_to" value="' . esc_attr( $sale_price_dates_to ) . '" placeholder="' . _x( 'To&hellip;', 'placeholder', 'woocommerce' ) . '  YYYY-MM-DD" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<a href="#" class="cancel_sale_schedule" style="display: inline-block; margin: 21px 0 0 10px;">' . __( 'Cancel', 'woocommerce' ) . '</a>' . wc_help_tip( __( 'The sale will end at the beginning of the set date.', 'woocommerce' ) ) . '
		</p>';

		// Hide Shop Price.
		//woocommerce_wp_checkbox( array( 'id' => '_bto_hide_shop_price', 'label' => __( 'Hide Price', 'woocommerce' ), 'desc_tip' => true, 'description' => __( 'Disable all internal price calculations and hide the Composite price displayed in the shop catalog and product summary.', 'woocommerce' ) ) );

		echo '</div>';
	}
}


// if( $post_type == 'product' ){
	$GLOBALS['WC_Bonster_Woocommerce_Admin'] = new WC_Bonster_Woocommerce_Admin();
// }