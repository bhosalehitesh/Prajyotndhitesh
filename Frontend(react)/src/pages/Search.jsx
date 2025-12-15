import React from 'react';
import { useSearchParams } from 'react-router-dom';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1>Search Results</h1>
      <p>Searching for: {query}</p>
      <p>Search functionality coming soon...</p>
    </div>
  );
};

export default Search;

