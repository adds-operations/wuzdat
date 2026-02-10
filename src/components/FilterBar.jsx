import React from 'react';
import './FilterBar.css';

const CATEGORIES = ['All', 'YouTube', 'Movies', 'Song', 'Read', 'Other'];

const FilterBar = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="filter-bar">
            <div className="container filter-scroll">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
                        onClick={() => onFilterChange(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
