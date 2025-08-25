import React, { useState } from 'react';
import axios from 'axios';

// Fallback Image Component
const FallbackImage = ({ src, alt, fallbackSrc = '/path/to/fallback-image.jpg', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const handleError = () => setImgSrc(fallbackSrc);
  return <img src={imgSrc} alt={alt} onError={handleError} {...props} />;
};

function App() {
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categories = ["smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration"];


  const fetchProducts = async () => {
    if (!category.trim()) {
      setError('Please enter a category');
      setProducts([]);
      setSearched(false);
      return;
    }

    if (!categories.includes(category)) {
      setError('Invalid category. Please select from the suggestions.');
      return;
    }

    setLoading(true);
    setError('');
    try {
     const res = await axios.post('https://api-driven-app-server.vercel.app/api/fetch-products', { category });

      setProducts(res.data);
      setCurrentPage(1);
      setSearched(true);
    } catch {
      setError('Failed to fetch products');
      setProducts([]);
      setSearched(true);
    }
    setLoading(false);
  };

  // Pagination computation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNum) => setCurrentPage(pageNum);

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-center">Fake Store Product Search</h1>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search categories: smartphones, laptops, fragrances, skincare, groceries, home-decoration"

          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="category-options"
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
        />
        <datalist id="category-options">
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </datalist>
        <button className="btn btn-primary" onClick={fetchProducts} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && searched && products.length === 0 && (
        <p className="text-center">No products found for "{category}"</p>
      )}

      <div className="row">
        {searched && currentProducts.map((p) => (
          <div key={p.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <FallbackImage
                src={p.image}
                alt={p.title}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'contain' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.title}</h5>
                <p className="card-text text-muted text-capitalize">{p.category}</p>
                <p className="card-text fw-bold">${p.price.toFixed(2)}</p>
                <button className="btn btn-outline-primary mt-auto" disabled>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searched && products.length > itemsPerPage && (
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => paginate(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default App;
