import React, { ChangeEventHandler, useEffect, useState } from 'react';
import flame from '../assets/flames.png'

const formatNumber = (number:number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number);
};

interface APIProduct{
  id : string;
  name : string;
  unitPrice : number
  sold :number
}
interface APIData {
  branchId : string;
  products : APIProduct[]
}
interface Product{
  name : string;
  revenue : number
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branch1Response = await fetch('api/branch1.json');
        const branch1Data:APIData = await branch1Response.json();

        const branch2Response = await fetch('api/branch2.json');
        const branch2Data:APIData  = await branch2Response.json();

        const branch3Response = await fetch('api/branch3.json');
        const branch3Data:APIData  = await branch3Response.json();

        const allProducts = [...branch1Data.products, ...branch2Data.products, ...branch3Data.products];
        const mergedProducts = mergeProducts(allProducts).sort((a, b) => {
          const nameA = a.name.toUpperCase(); 
          const nameB = b.name.toUpperCase();
          
          if (nameA < nameB) {
            return -1; 
          }
          
          if (nameA > nameB) {
            return 1; 
          }
          
          return 0; 
        });;
        setProducts(mergedProducts);
        setFilteredProducts(mergedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const mergeProducts = (products:APIProduct[]) => {
    const mergedMap = new Map();

    products.forEach((product) => {
      const { name, unitPrice,sold } = product;
      let revenue = unitPrice*sold;
      if (mergedMap.has(name)) {
        const existingProduct = mergedMap.get(name);
        mergedMap.set(name, { ...existingProduct, revenue: existingProduct.revenue + revenue });
      } else {
        mergedMap.set(name, {name:name,revenue:revenue});
      }
    });

    return Array.from(mergedMap.values());
  };

  const handleSearch:ChangeEventHandler<HTMLInputElement>  = (event:any) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = products.filter((product) => product.name.toLowerCase().includes(query));
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    const calculateTotalRevenue = () => {
      const total = filteredProducts.reduce((sum, product) => sum + product.revenue, 0);
      setTotalRevenue(total);
    };

    calculateTotalRevenue();
  }, [filteredProducts]);

  const renderTable = () => {
    if (filteredProducts.length === 0) {
      return <p>No products found.</p>;
    }

    return (
      <div className='gridtable h-100 px-5'>
        <table className='table table-striped border rounded mb-0 table-responsive h-90  w-100' >
        <thead className='table-dark' >
          <tr>
            <th >Product Name</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{formatNumber(product.revenue)}</td>
            </tr>
          ))}
        </tbody>
        </table>
        <div className='h-10 d-flex justify-content-center   pt-0 mt-0 border'>
          <h3 className=' '>Total {formatNumber(totalRevenue)}</h3>
        </div>
    </div>

    );
  };

  return (
    <div className="App h-100 w-100 ">
      <div className='header bg-dark d-flex justify-content-center '>
         <img src={flame} className='ms-3 mt-2' style={{width:'40px',height:'40px'}} alt='Flame Image' />
         <h4 className='ms-2 mt-3 ' style={{color:'#eae3e3'}}>Revenue Aggregator</h4>
      </div>
      <div className="search-container w-100 pt-2">
        <div className="form-group has-search w-75 border border-2 rounded  mx-auto">
          <span className="fa fa-search form-control-feedback" ></span>
          <input 
            type="text"  
            className="form-control" 
            placeholder="Search by product name"
            value={searchQuery}
            onChange={handleSearch}
            />

        </div>
      </div>
      <div className='content px-5 py-2 '  >
        {renderTable()}
      </div>

    </div>
  );
};

export default Home;

