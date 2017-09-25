<?php

class WC_Bonster_Composition_Products {
	private $post_type = 'bonster_composition';

	public function __construct(){
		add_action('save_post', array($this, 'save_composition_postdata'));
		add_action( 'init', array($this, 'composition_post_type') );
		add_action( 'init', array($this, 'composition_taxonomies'), 0 ); 
		add_filter( 'manage_edit-composition_columns', array($this, 'composition_edit_columns') );  
		// add_action( 'manage_composition_posts_custom_column', array($this, 'composition_custom_columns') );
		add_action( 'admin_print_scripts-post-new.php', array($this, 'composition_admin_script'));
		add_action( 'admin_print_scripts-post.php', array($this, 'composition_admin_script'));
	}

	/* Composition post type
	================================================== */
	public function composition_post_type() {
		$labels = array(
			'name' => __( 'Composiciones'),
			'singular_name' => __( 'Composición' ),
			'add_new' => _x('Añadir nueva', 'composition'),
			'add_new_item' => __('Añadir nueva Composición'),
			'edit_item' => __('Edit Composición'),
			'new_item' => __('New Composición'),
			'view_item' => __('View Composición'),
			'search_items' => __('Search Composición Items'),
			'not_found' =>  __('No se encontraron Composiciones'),
			'not_found_in_trash' => __('No se encontraron Composiciones en la Papelera'), 
			'parent_item_colon' => ''
		  );
		  
		  $args = array(
			'labels' => $labels,
			'public' => true,
			'publicly_queryable' => true,
			'show_ui' => true, 
			'query_var' => true,
	        'has_archive' => true,
			'capability_type' => 'post',
			'hierarchical' => false,
		    'show_ui' => true,
		    'show_in_menu' => 'edit.php?post_type=product',
			'menu_position' => 10,
			'menu_icon' => 'dashicons-networking',
			'rewrite' => array('slug' => __( 'bonster_composition' )),
			'supports' => array('title','thumbnail') //,'editor'
		  );
		  
		  register_post_type(__( 'bonster_composition' ), $args);
	}

	/* Composition taxonomies
	================================================== */
	public function composition_taxonomies(){
		/*// Categories
		register_taxonomy(
			'composition_category',
			'composition',
			array(
				'hierarchical' => true,
				'label' => 'Categories',
				'query_var' => true,
				'rewrite' => true
			)
		);
	    
		// Tags
		register_taxonomy(
			'composition_tags',
			'composition',
			array(
				'hierarchical' => false,
				'label' => 'Tags',
				'query_var' => true,
				'rewrite' => true
			)
		);*/
	}

	/* Composition edit
	================================================== */
	public function composition_edit_columns($columns){  
	    $columns = array(  
	        "cb" => "<input type=\"checkbox\" />",  
	        "title" => __( 'Nombre' ),
	        "composition_category" => __( 'Categories' ),
	        "composition_tags" => __( 'Tags' ),
	    );   

	    return $columns;  
	}

	/* Composition custom column
	================================================== */
	public function composition_custom_columns($column){  
	    global $post;  
	    switch ($column){    
			case "composition_category":
				echo get_the_term_list($post->ID, 'composition_category', '', ', ','');
			break;
			case "composition_tags":
				echo get_the_term_list($post->ID, 'composition_tags', '', ', ','');
			break;
	    }  
	}

	public function composition_admin_script(){
		global $post_type, $WC_Bonster_Composite_Products;

	    if( $this->post_type == $post_type ){
	    	// AngularJS Assets
	    	foreach (WC_Bonster_Composite_Products::$cssAssets as $key => $ass) {
		    	wp_register_style( $ass['key'], $ass['src'], $ass['deps'], $ass['ver'], $ass['type'] );
		    	wp_enqueue_style( $ass['key'] );
	    	}

	    	/*foreach (WC_Bonster_Composite_Products::$jsAssets as $key => $ass) {
		    	wp_register_script( $ass['key'], $ass['src'], $ass['deps'], $ass['ver'], true );
		    	wp_enqueue_script( $ass['key'] );
	    	}*/
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
				'search_products_nonce' => wp_create_nonce( 'search-products' ),
			);
			wp_localize_script( 'wc_bonster_bundle', 'wc_bonster_admin_meta_boxes', $params );

		    add_meta_box( 'components-meta-boxes', __('Componentes'), array($this, 'composition_meta_boxes'), $this->post_type, 'normal', 'high' );
		}
	}

	public function composition_meta_boxes(){
		global $post;
		$componentsData = maybe_unserialize( get_post_meta( $post->ID, '_wcb_composition_components_data', true ) );
		echo '<meta-box-component bons-components="' . ( is_array($componentsData) ? esc_attr(json_encode($componentsData)):'[]' ) . '"></meta-box-component>';
	}

	/* update meta_boxes
	================================================== */
	public function save_composition_postdata( $post_id ) {
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			return false;
		}

		global $post, $post_type;

		/*if ( !wp_verify_nonce( $_POST[$meta_box['name'].'_noncename'], plugin_basename(__FILE__) )) {  
			return $post_id;  
		} */
		if( $this->post_type != $post_type )
			return $post_id;

		if ( !current_user_can( 'edit_post', $post_id ))  
			return $post_id;

		$fields = array('name', 'productId', 'ref', 'qty', 'incrementPrice');
		$requestComponentsData = json_decode(stripslashes($_POST['wcBonsterComponents']), true);
		$componentsData = array();
		foreach($requestComponentsData as $cmp) {
			$item = array(); 
			foreach ($cmp as $key => $value) {
				if( in_array($key, $fields) ){
					$item[$key] = $value;
				}
			}
			$componentsData[] = $item;
			/*if(get_post_meta($post_id, $meta_box['name'].'_value') == "")  
				add_post_meta($post_id, $meta_box['name'].'_value', $data, true);  
			elseif($data != get_post_meta($post_id, $meta_box['name'].'_value', true))  
				update_post_meta($post_id, $meta_box['name'].'_value', $data);  
			elseif($data == "")  
				delete_post_meta($post_id, $meta_box['name'].'_value', get_post_meta($post_id, $meta_box['name'].'_value', true));*/  
		}

		if( is_array($componentsData) )
			update_post_meta( $post_id, '_wcb_composition_components_data', $componentsData );

		// WC_Admin_Meta_Boxes::add_error( "$error JJ" );
	}
}
$GLOBALS['WC_Bonster_Composition_Products'] = new WC_Bonster_Composition_Products();
