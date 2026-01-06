import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

const ITEM_HEIGHT = 80; // Increased to accommodate larger gap
const LIST_HEIGHT = 600;
const ITEM_GAP = 16; // Gap between items

function Items() {
  const { apiBaseUrl } = useData();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50;
  const isMountedRef = useRef(true);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadItems = useCallback(async (page = 1, query = '') => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });
      if (query) {
        params.append('q', query);
      }

      const res = await fetch(`${apiBaseUrl}/items?${params}`);
      if (!isMountedRef.current) return;
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (!isMountedRef.current) return;


      
      setItems(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch items:', error);
        setItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [itemsPerPage, apiBaseUrl]);

  useEffect(() => {
    loadItems(1, searchQuery);
  }, []); // Initial load only

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);

    // Debounce search to avoid too many API calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadItems(1, value);
    }, 300);
  };

  const handlePageChange = (page) => {
    loadItems(page, searchQuery);
  };

  // Render function for virtualized list items
  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style}>
        <Link 
          to={'/items/' + item.id}
          style={{
            display: 'flex',
            padding: '16px 20px',
            marginBottom: `${ITEM_GAP}px`,
            border: 'none',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            height: ITEM_HEIGHT - ITEM_GAP,
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '600',
              fontSize: '18px',
              flexShrink: 0
            }}>
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1a202c',
                marginBottom: '4px'
              }}>
                {item.name}
              </div>
              {item.category && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  {item.category}
                </div>
              )}
            </div>
          </div>
          {item.price && (
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#2d3748',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ${item.price.toLocaleString()}
            </div>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
      padding: '32px 20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            Items Catalog
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#718096',
            fontWeight: '500'
          }}>
            Browse and search through our collection
          </p>
        </div>
        
        {/* Search Section */}
        <div style={{ 
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '500px'
          }}>
            <input
              type="text"
              placeholder="Search items by name or category..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '16px 20px 16px 48px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
              aria-label="Search items"
            />
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#a0aec0'
            }}>
              🔍
            </span>
          </div>
          {totalItems > 0 && (
            <div style={{ 
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#718096',
                fontWeight: '500',
                padding: '6px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {items.length} of {totalItems} items
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ 
            padding: '80px 20px', 
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <div style={{ 
              fontSize: '18px', 
              color: '#4a5568',
              fontWeight: '600'
            }}>
              Loading items...
            </div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ 
            padding: '80px 20px', 
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ 
              fontSize: '20px', 
              color: '#4a5568',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              No items found
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096'
            }}>
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <FixedSizeList
                height={Math.min(LIST_HEIGHT, items.length * ITEM_HEIGHT + ITEM_GAP)}
                itemCount={items.length}
                itemSize={ITEM_HEIGHT}
                width="100%"
              >
                {Row}
              </FixedSizeList>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                marginTop: '32px', 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: currentPage === 1 || loading 
                      ? '#e2e8f0' 
                      : '#ffffff',
                    color: currentPage === 1 || loading 
                      ? '#a0aec0' 
                      : '#4a5568',
                    cursor: currentPage === 1 || loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: currentPage === 1 || loading 
                      ? 'none' 
                      : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    opacity: currentPage === 1 || loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1 && !loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1 && !loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  aria-label="Previous page"
                >
                  ← Previous
                </button>
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#4a5568',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  Page <span style={{ color: '#667eea' }}>{currentPage}</span> of {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: currentPage === totalPages || loading 
                      ? '#e2e8f0' 
                      : '#ffffff',
                    color: currentPage === totalPages || loading 
                      ? '#a0aec0' 
                      : '#4a5568',
                    cursor: currentPage === totalPages || loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: currentPage === totalPages || loading 
                      ? 'none' 
                      : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    opacity: currentPage === totalPages || loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages && !loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages && !loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Items;