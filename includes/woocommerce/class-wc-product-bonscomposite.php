<?php
/**
 * Composite Product Class
 * @class 	WC_Product_Bto
 * @version 2.1.5
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class WC_Product_Bonscomposite extends WC_Product {
	public function __construct( $bundle_id ) {
		$this->product_type = 'bonscomposite';

		parent::__construct( $bundle_id );

		$this->compositions_data = array();		
		$compositions = maybe_unserialize( get_post_meta( $this->id, '_wcb_composition_compositions_data', true ) );
		foreach ($compositions as $key => $composition) {
			$componentsData = maybe_unserialize( get_post_meta( $composition['id'], '_wcb_composition_components_data', true ) );
			foreach ($componentsData as &$component) {
				$component['img'] = wp_get_attachment_image_src( get_post_thumbnail_id( $component['productId'] ), 'thumbnail' ); //get_the_post_thumbnail( $component['productId'], apply_filters( 'single_product_large_thumbnail_size', 'shop_single img-responsive' ) );
			}
			$composition['components'] = $componentsData;
			$this->compositions_data[] = $composition;
		}
	}
}