// in src/pages/CataloguePage.js or ProductsPage.js
import { useNavigate } from "react-router-dom";
import ProductTable from "../components/ProductTable";

function CataloguePage() {
  const navigate = useNavigate();
  return (
    <ProductTable
      onView={record => navigate(`/products/${record.id}`)}
      onEdit={record => navigate(`/products/edit/${record.id}`)}
    />
  );
}

export default CataloguePage;
