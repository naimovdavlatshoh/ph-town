import { Helmet } from 'react-helmet-async';

import { ProductListView2 } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Product List</title>
      </Helmet>

      <ProductListView2 />
    </>
  );
}
