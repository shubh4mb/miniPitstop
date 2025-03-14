import { useState, useEffect } from "react";
import { getBrands } from "../../../api/admin.api";

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    brands: [],
    scale: [],
    sortBy: "default",
  });
  const availableScales = ["1:18", "1:24", "1:32", "1:43", "1:64"];
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedScales, setSelectedScales] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getBrands();
        setBrands(response.brands || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [name]: Math.max(0, parseInt(value) || 0),
        },
      };
      debounceFilterUpdate(updatedFilters);
      return updatedFilters;
    });
  };

  const debounceFilterUpdate = debounce((updatedFilters) => {
    onFilterChange(updatedFilters);
  }, 300);

  const handleCheckboxChange = (type, value, setSelected, selectedItems) => {
    const updatedItems = selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];
    setSelected(updatedItems);

    const updatedFilters = {
      ...filters,
      [type]: updatedItems,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSortChange = (e) => {
    const updatedFilters = {
      ...filters,
      sortBy: e.target.value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const initialFilters = {
      priceRange: { min: 0, max: 10000 },
      brands: [],
      scale: [],
      sortBy: "default",
    };
    setFilters(initialFilters);
    setSelectedBrands([]);
    setSelectedScales([]);
    onFilterChange(initialFilters);
  };

  return (
    <div className=" p-3 lg:p-6 user-glass-effect shadow-lg rounded-lg text-gray-800">
      <h2 className="text-xl font-bold mb-6">Filter</h2>
      
      {/* Price Range */}
      <div className="mb-6 border-b pb-4">
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="flex items-center lg:gap-4">
          <input
            type="number"
            name="min"
            value={filters.priceRange.min}
            onChange={handlePriceChange}
            className="w-full lg:p-2 border rounded-md"
            placeholder="Min"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            name="max"
            value={filters.priceRange.max}
            onChange={handlePriceChange}
            className="w-full p-2 border rounded-md"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6 border-b pb-4">
        <h3 className="font-semibold mb-4">Brands</h3>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <label key={brand._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand._id)}
                onChange={() =>
                  handleCheckboxChange(
                    "brands",
                    brand._id,
                    setSelectedBrands,
                    selectedBrands
                  )
                }
                className="accent-red-500"
              />
              {brand.name}
            </label>
          ))}
        </div>
      </div>

      {/* Scales */}
      <div className="mb-6 border-b pb-4">
        <h3 className="font-semibold mb-4">Scale</h3>
        <div className="flex flex-wrap gap-2">
          {availableScales.map((scale) => (
            <label key={scale} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedScales.includes(scale)}
                onChange={() =>
                  handleCheckboxChange(
                    "scale",
                    scale,
                    setSelectedScales,
                    selectedScales
                  )
                }
                className="accent-blue-500"
              />
              {scale}
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="default">Default</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={resetFilters}
        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
      >
        Reset Filters
      </button>
    </div>
  );
};

function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default FilterBar;
