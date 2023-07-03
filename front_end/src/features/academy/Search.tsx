import React from 'react';
 
 export const Search = () => {
    return(
        <header>
            <h2 className="header__title">Search it. Explore it. Learn it.</h2>
            <input
                type="text"
                className="header__search"
                placeholder="Enter a name, an address or an id"
            />
        </header>
    )
 }
 
 export default Search;