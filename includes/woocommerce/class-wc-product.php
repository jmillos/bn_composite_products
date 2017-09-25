<?php 

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WC_Bonster_Woocommerce_Product {
	public function __construct() {
		add_action( 'plugins_loaded', array($this, 'wc_bonster_plugins_loaded') );
	}

	public function wc_bonster_plugins_loaded(){
		include ("class-wc-product-bonscomposite.php");

		// add_action( 'init', array($this, 'init') );

		// Single product template
		add_action( 'woocommerce_bonscomposite_add_to_cart', array( $this, 'wc_bonster_add_to_cart' ) );

		// Add composite configuration data to all composited items
		add_filter( 'woocommerce_add_cart_item_data', array( $this, 'wc_bonster_add_cart_item_data' ), 10, 2 );

		// Add composited items to the cart
		add_action( 'woocommerce_add_to_cart', array( $this, 'wc_bonster_add_items_to_cart' ), 10, 6 );
		// add_filter( 'woocommerce_add_cart_item', array( $this, 'wc_bonster_add_cart_item' ), 10, 2 );

		//
		add_filter('woocommerce_before_calculate_totals', array($this, 'add_custom_price'), 10, 1);

		// Control modification of composited items' quantity
		add_filter( 'woocommerce_cart_item_quantity', array( $this, 'cart_item_quantity' ), 10, 2 );
		add_filter( 'woocommerce_cart_item_remove_link', array( $this, 'wc_bonster_cart_item_remove_link' ), 10, 2 );

		// Remove subitems composite parent
		add_action( 'woocommerce_cart_item_removed', array( $this, 'cart_item_removed' ), 10, 2 );
		add_action( 'woocommerce_cart_item_restored', array( $this, 'cart_item_restored' ), 10, 2 );

		// Modify order items to include composite meta - TODO: 3rd argument
		add_action( 'woocommerce_add_order_item_meta', array( $this, 'add_order_item_meta' ), 10, 2 );

		// Manage stock
		add_filter( 'woocommerce_reduce_order_stock_quantity', array($this, 'reduce_order_stock_quantity'), 10, 2 );
		add_filter( 'woocommerce_order_item_quantity', array( $this, 'order_item_quantity' ), 10, 3 );		

		// Hide composite configuration metadata in order line items
		// add_filter( 'woocommerce_hidden_order_itemmeta', array( $this, 'woo_bto_hidden_order_item_meta' ) );

		// Filter admin dashboard item count
		// add_filter( 'woocommerce_get_item_count',  array( $this, 'woo_bto_dashboard_recent_orders_count' ), 10, 3 );
		
		// No show products composite children in cart
		add_filter( 'woocommerce_cart_item_visible', array( $this, 'cart_item_visible' ), 10, 3 );
		add_filter( 'woocommerce_widget_cart_item_visible', array( $this, 'cart_item_visible' ), 10, 3 );		

		// add_filter( 'woocommerce_cart_item_thumbnail', array( $this, 'cart_item_thumbnail' ), 10, 3 );				
	}

	public function front_script(){
		// if(is_front_page()){
			global $WC_Bonster_Composite_Products;
			$package = WC_Bonster_Composite_Products::$jsAssets['angularjs-package'];
	    	wp_register_script( $package['key'], $package['src'], $package['deps'], $package['ver'], true );
			wp_enqueue_script( $package['key'] );

		    wp_register_script( 'wc_bonster_bundle_front', $WC_Bonster_Composite_Products->wc_bonster_plugin_url()."/assets/js/bundle-front.js", array('jquery', 'angularjs-package'), $WC_Bonster_Composite_Products->version, true );
		    wp_enqueue_script( 'wc_bonster_bundle_front' );
		// }
	}

	public function wc_bonster_add_to_cart(){
		global $product, $post, $WC_Bonster_Composite_Products;

		$this->front_script();

		echo '<form method="post" enctype="multipart/form-data">';
	    	echo '<build-product-composite bons-compositions="'. ( is_array($product->compositions_data) ? esc_attr(json_encode($product->compositions_data)):'[]' ) .'" bons-baseprice="'. $product->price.'"></build-product-composite>';
	    	echo '<input type="hidden" name="add-to-cart" value="' . esc_attr( $product->id ) . '" />';
	    echo '</form>';
		// echo "<pre>{{ " . json_encode($product) . " | json:4 }}</pre>";
	}

	public function add_custom_price($cart_object ) {
		// echo "<pre>", var_dump($cart_object->cart_contents);die;
	    // global $post;
		// $post_id=$post->ID();  // To get post id
		 // Code to get custom field here.
	    $custom_price = 500; // This will be your custome price
	    foreach ( $cart_object->cart_contents as $key => $value ) {
	        if( isset($value['bons_composite_item']['regular_price']) ) $value['data']->price = $value['bons_composite_item']['regular_price'];
	    }
	}

	/**
	 * Adds configuration-specific cart-item data
	 * @param  array 	$cart_item_data
	 * @param  int 		$product_id
	 * @return void
	 */
	public function wc_bonster_add_cart_item_data( $cart_item_data, $product_id ) {
		// Get product type
		$terms 			= get_the_terms( $product_id, 'product_type' );
		$product_type 	= ! empty( $terms ) && isset( current( $terms )->name ) ? sanitize_title( current( $terms )->name ) : 'simple';

		if($product_type != 'bonscomposite')
			return $cart_item_data;			

		$data_items_cart = isset($_REQUEST['bons_data_order']) ? json_decode( stripslashes_deep($_REQUEST['bons_data_order']), true ):array();

		if( count($data_items_cart) > 0 ){
			$compositeData = array();

			if ( isset($data_items_cart['basicItems']) ) {
				foreach ($data_items_cart['basicItems'] as $key => $item) {
					// $qtyTotal = $item['qty']*$item['qtyOrder'];
					$row = array(
						'product_id' => $item['productId'],
						'quantity' => $item['qty'],
						'qtyOrder' => $item['qtyOrder'],
						'title' => $item['name'],
						'regular_price' => $item['price'],
					);

					$compositeData[] = $row;
				}
			}

			if ( isset($data_items_cart['additionalItems']) ) {
				foreach ($data_items_cart['additionalItems'] as $key => $composition) {
					foreach ($composition as $item) {
						$qtyTotal = $item['qty']*$item['qtyOrder'];
						$row = array(
							'product_id' => $item['productId'],
							'quantity' => $item['qty'],
							'qtyOrder' => $item['qtyOrder'],
							'title' => $item['name'],
							'regular_price' => $item['price'],
							'is_additional' => true,
						);
						$compositeData[] = $row;
					}
				}
			}

			// echo "<pre>", print_r($compositeData);die;
			$cart_item_data['bons_composite_data'] = $compositeData;
		}

		return $cart_item_data;
	}

	public function wc_bonster_add_items_to_cart($item_cart_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data){
		// echo "<pre>", print_r($cart_item_data);

		// Runs when adding container item - adds composited items
		if ( isset( $cart_item_data[ 'bons_composite_data' ] ) && !isset( $cart_item_data[ 'bons_composite_parent' ] ) ) {
			// Only attempt to add composited items if they don't already exist
			foreach ( WC()->cart->cart_contents as $cart_key => $cart_value ) {
				if ( isset( $cart_value[ 'bons_composite_data' ] ) && isset( $cart_value[ 'bons_composite_parent' ] ) && $item_cart_key == $cart_value[ 'bons_composite_parent' ] ) {
					return;
				}
			}

			// This id is unique, so that bundled and non-bundled versions of the same product will be added separately to the cart.
			// $composited_item_cart_data = array( 'bons_composite_parent' => $item_cart_key, 'bons_composite_data' => $cart_item_data[ 'bons_composite_data' ] );

			// Now add all items - yay!
			foreach ( $cart_item_data[ 'bons_composite_data' ] as $item ) {
				$composited_product_id = $item[ 'product_id' ];				
				$quantity = $item[ 'qtyOrder' ];
				
				// echo "<pre>", var_dump($item);
				$composited_item_cart_data = array( 'bons_composite_parent' => $item_cart_key, 'bons_composite_item' => $item );
				$ret = WC()->cart->add_to_cart( $composited_product_id, $quantity, '', '', $composited_item_cart_data );
				// echo "<pre>", var_dump($ret);
			}
			// die;
		}

		if( isset($cart_item_data['bons_composite_parent']) && ! empty($cart_item_data['bons_composite_parent']) ){
			WC()->cart->cart_contents[ $item_cart_key ][ 'bons_composite_parent' ] = $cart_item_data['bons_composite_parent'];
		}

		// Runs when adding bundled items - adds child data to parent
		/*if ( isset( $cart_item_data[ 'bons_composite_parent' ] ) && ! empty( $cart_item_data[ 'bons_composite_parent' ] ) ) {

			$parent_item = WC()->cart->cart_contents[ $cart_item_data[ 'bons_composite_parent' ] ];

			if ( ! empty( $parent_item ) ) {
				if ( ! in_array( $item_cart_key, $GLOBALS[ 'composite_children' ] ) )
					$GLOBALS[ 'composite_children' ][] = $item_cart_key;
			}		
		}*/
	}

	// private $cnt = 0;
	public function wc_bonster_add_cart_item($cart_contents, $cart_item_key){
		/*echo "<pre>", var_dump($cart_contents, $cart_item_key);

		if ($this->cnt > 2) {
			die;
		}

		$this->cnt++;*/
		if( isset($cart_contents['bons_composite_item']) )
			$cart_contents['quantity'] = $cart_contents['bons_composite_item']['qtyOrder'];

		return $cart_contents;
	}

	/**
	 * Composited items can't be removed individually from the cart
	 * @param  string 	$link
	 * @param  string 	$cart_item_key
	 * @return string
	 */
	public function wc_bonster_cart_item_remove_link( $link, $cart_item_key ) {
		global $woocommerce;

		// if( isset(WC()->cart->cart_contents[ $cart_item_key ][ 'bons_composite_parent' ]) ) echo "<pre>", print_r(WC()->cart->cart_contents[ $cart_item_key ][ 'bons_composite_parent' ]), "</pre>";

		if ( isset( WC()->cart->cart_contents[ $cart_item_key ][ 'bons_composite_parent' ] ) && ! empty( WC()->cart->cart_contents[ $cart_item_key ][ 'bons_composite_parent' ] ) )
			return '';

		return $link;
	}

	/**
	 * Remove bundled cart items with parent.
	 *
	 * @param  string  $cart_item_key
	 * @param  WC_Cart $cart
	 * @return void
	 */
	public function cart_item_removed( $cart_item_key, $cart ) {

		// echo "<pre>", json_encode($cart->removed_cart_contents[ $cart_item_key ][ 'composite_data' ]); die;
		// echo "<pre>", json_encode($cart->cart_contents);die;

		if ( ! empty( $cart->removed_cart_contents[ $cart_item_key ][ 'bons_composite_data' ] ) ) {

			// $bundled_item_cart_keys = $cart->removed_cart_contents[ $cart_item_key ][ 'composite_data' ];

			foreach ( $cart->cart_contents as $bundled_item_cart_key => $item ) {

				if ( isset( $cart->cart_contents[ $bundled_item_cart_key ]['bons_composite_parent'] ) && $cart->cart_contents[ $bundled_item_cart_key ]['bons_composite_parent'] == $cart_item_key ) {

					$remove = $cart->cart_contents[ $bundled_item_cart_key ];

					$cart->removed_cart_contents[ $bundled_item_cart_key ] = $remove;

					unset( $cart->cart_contents[ $bundled_item_cart_key ] );

					do_action( 'woocommerce_cart_item_removed', $bundled_item_cart_key, $cart );
				}
			}
		}
	}

	/**
	 * Restore bundled cart items with parent.
	 *
	 * @param  string  $cart_item_key
	 * @param  WC_Cart $cart
	 * @return void
	 */
	public function cart_item_restored( $cart_item_key, $cart ) {

		// echo "<pre>", json_encode($cart->removed_cart_contents); die;

		if ( ! empty( $cart->cart_contents[ $cart_item_key ][ 'bons_composite_data' ] ) ) {

			// $bundled_item_cart_keys = $cart->cart_contents[ $cart_item_key ][ 'composite_children' ];

			foreach ( $cart->removed_cart_contents as $bundled_item_cart_key => $item ) {

				if ( isset( $cart->removed_cart_contents[ $bundled_item_cart_key ]['bons_composite_parent'] ) && $cart->removed_cart_contents[ $bundled_item_cart_key ]['bons_composite_parent'] == $cart_item_key ) {

					$remove = $cart->removed_cart_contents[ $bundled_item_cart_key ];

					$cart->cart_contents[ $bundled_item_cart_key ] = $remove;

					unset( $cart->removed_cart_contents[ $bundled_item_cart_key ] );

					do_action( 'woocommerce_cart_item_restored', $bundled_item_cart_key, $cart );
				}
			}
		}
	}

	/**
	 * Adds composite info to order items - TODO: add $cart_item_key
	 * @param  int 		$order_item_id
	 * @param  array 	$cart_item_values
	 * @param  string 	$cart_item_key
	 * @return void
	 */
	public function add_order_item_meta( $order_item_id, $cart_item_values ) {
		/*echo "<pre>", print_r($cart_item_values);

		if ($this->cnt > 2) {
			die;
		}

		$this->cnt++;*/

		global $woocommerce;

		/*if ( isset( $cart_item_values[ 'composite_children' ] ) && ! empty( $cart_item_values[ 'composite_children' ] ) ) {

			wc_bto_add_order_item_meta( $order_item_id, '_composite_children', $cart_item_values[ 'composite_children' ] );

			if ( ! empty( $cart_item_values[ 'data' ]->per_product_pricing ) )
				wc_bto_add_order_item_meta( $order_item_id, '_per_product_pricing', $cart_item_values[ 'data' ]->per_product_pricing );
		}*/

		if ( isset( $cart_item_values[ 'bons_composite_parent' ] ) && ! empty( $cart_item_values[ 'bons_composite_parent' ] ) ) {

			wc_add_order_item_meta( $order_item_id, '_bons_composite_qty', $cart_item_values['bons_composite_item']['quantity'] );

			// find parent in cart - not really necessary since we know its going to be there

			$product_key = $woocommerce->cart->find_product_in_cart( $cart_item_values[ 'bons_composite_parent' ] );

			if ( ! empty( $product_key ) ) {
				$product_name = WC()->cart->cart_contents[ $product_key ][ 'data' ]->post->post_title;
				wc_add_order_item_meta( $order_item_id, '_bons_composite_partof', __( $product_name ) );
			}

		}

		/*if ( isset( $cart_item_values[ 'composite_item' ] ) && ! empty( $cart_item_values[ 'composite_item' ] ) ) {
			wc_bto_add_order_item_meta( $order_item_id, '_composite_item', $cart_item_values[ 'composite_item' ] );
		}

		if ( isset( $cart_item_values[ 'composite_data' ] ) && ! empty( $cart_item_values[ 'composite_data' ] ) ) {
			// TODO: uncomment in WC 2.1
			//wc_bto_add_order_item_meta( $order_item_id, '_composite_cart_key', $cart_item_key );
			wc_bto_add_order_item_meta( $order_item_id, '_composite_data', $cart_item_values[ 'composite_data' ] );
		}*/
	}

	public function reduce_order_stock_quantity($order_item_qty, $order_item_id){
		$qtyComposite = wc_get_order_item_meta($order_item_id, '_bons_composite_qty');
		return $order_item_qty*$qtyComposite;
	}

	public function order_item_quantity($qty, $order, $item){
		// echo "<pre>", var_dump($qty, $order, $item);die;
		if( isset($item['bons_composite_qty']) ){
			$qtyComposite = $item['bons_composite_qty'];
			return $qty*$qtyComposite;
		}

		return $qty;
	}

	public function cart_item_visible($true,  $cart_item,  $cart_item_key){
		// echo "<pre>", var_dump($true, $cart_item, $cart_item_key);die;
		if( isset($cart_item['bons_composite_parent']) ){
			return false;
		}

		return $true;
	}

	/**
	 * Composited item quantities can't be changed individually
	 * @param  string 	$quantity
	 * @param  string 	$cart_item_key
	 * @return string
	 */
	public function cart_item_quantity( $quantity, $cart_item_key ) {
		if ( isset(WC()->cart->cart_contents[ $cart_item_key ]['bons_composite_data']) ) {
			return WC()->cart->cart_contents[ $cart_item_key ][ 'quantity' ];
		}
		return $quantity;
	}
}

$GLOBALS['WC_Bonster_Woocommerce_Product'] = new WC_Bonster_Woocommerce_Product();
