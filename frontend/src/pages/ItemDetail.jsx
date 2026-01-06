import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

function ItemDetail() {
  const { id } = useParams();
  const { apiBaseUrl } = useData();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/items/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Item not found');
        }
        return res.json();
      })
      .then(data => {
        if (isMountedRef.current) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          navigate('/');
        }
      });
  }, [id, navigate, apiBaseUrl]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '56px',
            height: '56px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{ 
            fontSize: '18px', 
            color: '#4a5568',
            fontWeight: '600'
          }}>
            Loading item details...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
      padding: '32px 20px'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto'
      }}>
        {/* Back Button */}
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px', 
            color: '#667eea', 
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          Back to Items
        </Link>

        {/* Item Detail Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
            zIndex: 0
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Item Icon/Initial */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
            }}>
              {item.name.charAt(0).toUpperCase()}
            </div>

            {/* Item Name */}
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '8px', 
              fontSize: '36px', 
              fontWeight: '800',
              color: '#1a202c',
              letterSpacing: '-0.02em'
            }}>
              {item.name}
            </h2>

            {/* Item Details */}
            <div style={{ 
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Category */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f7fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#718096',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}>
                  Category
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  {item.category || 'N/A'}
                </div>
              </div>

              {/* Price */}
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#667eea',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}>
                  Price
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ${item.price ? item.price.toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* ID */}
              {item.id && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#718096',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    Item ID
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontFamily: 'monospace'
                  }}>
                    #{item.id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;