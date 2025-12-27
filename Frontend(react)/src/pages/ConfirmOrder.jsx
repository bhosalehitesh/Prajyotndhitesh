import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES, getRoute } from '../constants/routes';
import { placeOrder, getCart, addToCartAPI, getStoreBySlug, getUserByPhone, getUserOrders, updateUserAddressByPhone } from '../utils/api';

// Get backend URL - try to match the API_CONFIG pattern
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // For localhost, backend is typically at port 8080 without /api
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  return `${protocol}//${hostname}:8080`;
};

// Get API base URL - try both with and without /api
const getApiBaseUrl = () => {
  const baseUrl = getBackendUrl();
  // Backend endpoints are at root level (not /api) based on PaymentController
  // So we return baseUrl without /api
  return baseUrl;
};

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { storeSlug, currentStore, getStoreId } = useStore();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { isDarkMode } = useTheme();

  const [address, setAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'RAZORPAY'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const autoUpdateAttempted = useRef(new Set()); // Track addresses we've attempted to auto-update

  const itemTotal = getCartTotal();
  const deliveryFee = 0; // Free delivery
  const codCharges = 10; // Cash on Delivery charges
  const orderTotal = paymentMethod === 'COD'
    ? itemTotal + deliveryFee + codCharges
    : itemTotal + deliveryFee;

  // Load address from location state, database, or localStorage
  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      console.log('ConfirmOrder: Loading addresses, location.state:', location.state);

      const addresses = [];

      // 1. Priority: Address from location state (just selected from checkout)
      if (location.state?.address) {
        console.log('ConfirmOrder: Address found in location.state:', location.state.address);
        const stateAddress = { ...location.state.address, source: 'current' };
        // Set address with source so update button can detect it
        setAddress(stateAddress);
        addresses.push(stateAddress);
        // Reset saved status for new address from checkout
        setIsAddressSaved(false);
        // Don't return early - continue to load other saved addresses
      }

      // 2. Load from database if user is authenticated
      if (isAuthenticated && user?.phone) {
        try {
          const token = user.token || localStorage.getItem('authToken');
          const userId = user.id || user.userId;

          // Get user data from database
          const userData = await getUserByPhone(user.phone, token);
          console.log('ConfirmOrder: User data from database:', userData);

          // Add address from User table
          if (userData && (userData.pincode || userData.flatOrHouseNo || userData.areaOrStreet)) {
            const dbAddress = {
              customerName: userData.fullName || '',
              mobileNumber: userData.phone || user.phone,
              pincode: userData.pincode || '',
              houseNumber: userData.flatOrHouseNo || '',
              areaStreet: userData.areaOrStreet || '',
              landmark: userData.landmark || '',
              city: userData.city || '',
              state: userData.state || '',
              addressType: userData.addressType || 'Other',
              emailId: userData.email || '',
              source: 'database'
            };
            addresses.push(dbAddress);

            // Set as current address if no address is set yet
            if (!address) {
              setAddress(dbAddress);
              // Mark as saved since it's from database
              setIsAddressSaved(true);
            }

            // If address from database matches current address, mark as saved
            if (address &&
              address.pincode === dbAddress.pincode &&
              (address.houseNumber || address.flatOrHouseNo) === dbAddress.houseNumber &&
              (address.areaStreet || address.areaOrStreet) === dbAddress.areaStreet) {
              setIsAddressSaved(true);
            }

            // Mark database address as saved (can be reused)
            dbAddress.isSaved = true;
          }

          // Extract unique addresses from order history
          if (userId) {
            try {
              const orders = await getUserOrders(userId);
              console.log('ConfirmOrder: User orders from database:', orders);

              if (Array.isArray(orders) && orders.length > 0) {
                // Extract unique addresses from orders
                const orderAddresses = new Map();

                orders.forEach(order => {
                  if (order.address && typeof order.address === 'string' && order.address.trim()) {
                    // Parse address string (format: "name, house, area, city, state, pincode")
                    const addressParts = order.address.split(',').map(s => s.trim()).filter(Boolean);

                    if (addressParts.length >= 4) {
                      // Try to parse the address string
                      // Common format: "name, house, area, city, state, pincode"
                      const parsedAddress = {
                        customerName: addressParts[0] || userData?.fullName || '',
                        houseNumber: addressParts[1] || '',
                        areaStreet: addressParts[2] || '',
                        city: addressParts[3] || '',
                        state: addressParts[4] || '',
                        pincode: addressParts[5] || '',
                        mobileNumber: order.mobile ? String(order.mobile) : (userData?.phone || user.phone),
                        source: 'order_history',
                        orderId: order.ordersId || order.id
                      };

                      // Create a unique key for this address
                      const addressKey = `${parsedAddress.pincode}-${parsedAddress.houseNumber}-${parsedAddress.areaStreet}`;

                      // Only add if not already in map and not duplicate of existing addresses
                      if (!orderAddresses.has(addressKey)) {
                        const isDuplicate = addresses.some(addr => {
                          const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
                          const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
                          const addrPincode = addr.pincode || '';

                          return addrPincode === parsedAddress.pincode &&
                            addrHouseNumber === parsedAddress.houseNumber &&
                            addrAreaStreet === parsedAddress.areaStreet;
                        });

                        if (!isDuplicate) {
                          orderAddresses.set(addressKey, parsedAddress);
                        }
                      }
                    }
                  }
                });

                // Add unique addresses from orders
                orderAddresses.forEach((orderAddr) => {
                  // Mark order history addresses as saved (can be reused)
                  orderAddr.isSaved = true;
                  addresses.push(orderAddr);
                  console.log('ConfirmOrder: Added address from order history:', orderAddr);
                });
              }
            } catch (orderError) {
              console.error('ConfirmOrder: Error loading orders for address extraction:', orderError);
              // Don't fail if orders can't be loaded
            }
          }
        } catch (error) {
          console.error('ConfirmOrder: Error loading address from database:', error);
        }
      }

      // 3. Load saved addresses from localStorage (user-specific, up to 5)
      if (isAuthenticated && user?.phone) {
        try {
          const userAddressesKey = `userAddresses_${user.phone}`;
          const savedAddressesStr = localStorage.getItem(userAddressesKey);
          if (savedAddressesStr) {
            const parsedAddresses = JSON.parse(savedAddressesStr);
            console.log('ConfirmOrder: Found saved addresses for user:', parsedAddresses.length);

            if (Array.isArray(parsedAddresses)) {
              parsedAddresses.forEach(addr => {
                // Normalize field names for comparison
                const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
                const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
                const addrPincode = addr.pincode || '';

                const isDuplicate = addresses.some(existing => {
                  const existingHouseNumber = existing.houseNumber || existing.flatOrHouseNo || '';
                  const existingAreaStreet = existing.areaStreet || existing.areaOrStreet || '';
                  const existingPincode = existing.pincode || '';

                  return existingPincode === addrPincode &&
                    existingHouseNumber === addrHouseNumber &&
                    existingAreaStreet === addrAreaStreet;
                });

                if (!isDuplicate) {
                  // Mark localStorage saved addresses as saved (can be reused)
                  addresses.push({ ...addr, source: 'saved', isSaved: true });
                }
              });
            }
          }
        } catch (e) {
          console.error('ConfirmOrder: Error loading saved addresses:', e);
        }
      }

      // 4. Load from localStorage selectedAddress (fallback)
      try {
        const savedAddressStr = localStorage.getItem('selectedAddress');
        if (savedAddressStr) {
          const parsedAddress = JSON.parse(savedAddressStr);
          console.log('ConfirmOrder: Address found in localStorage (selectedAddress):', parsedAddress);

          // Only add if it's different from existing addresses
          const parsedHouseNumber = parsedAddress.houseNumber || parsedAddress.flatOrHouseNo || '';
          const parsedAreaStreet = parsedAddress.areaStreet || parsedAddress.areaOrStreet || '';
          const parsedPincode = parsedAddress.pincode || '';

          const isDuplicate = addresses.some(addr => {
            const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
            const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
            const addrPincode = addr.pincode || '';

            return addrPincode === parsedPincode &&
              addrHouseNumber === parsedHouseNumber &&
              addrAreaStreet === parsedAreaStreet;
          });

          if (!isDuplicate) {
            addresses.push({ ...parsedAddress, source: 'localStorage' });
          }

          // Set as current address if no address is set yet
          if (!address) {
            setAddress(parsedAddress);
            // Mark as saved since it's from localStorage
            setIsAddressSaved(true);
          }

          // Mark localStorage address as saved (can be reused)
          parsedAddress.isSaved = true;
        }
      } catch (e) {
        console.error('ConfirmOrder: Error loading address from localStorage:', e);
      }

      // 5. Check for additional saved addresses in localStorage (stored as 'addresses' array - legacy)
      try {
        // Check 'addresses' key (used by Checkout page)
        const addressesStr = localStorage.getItem('addresses');
        if (addressesStr) {
          const parsedAddresses = JSON.parse(addressesStr);
          if (Array.isArray(parsedAddresses)) {
            console.log('ConfirmOrder: Found addresses array in localStorage:', parsedAddresses.length, 'addresses');

            // Filter addresses by current user's phone if authenticated
            const userPhone = isAuthenticated && user?.phone ? user.phone : null;
            const userAddresses = userPhone
              ? parsedAddresses.filter(addr =>
                (addr.userPhone === userPhone || addr.mobileNumber === userPhone || !addr.userPhone)
              )
              : parsedAddresses;

            userAddresses.forEach(addr => {
              // Normalize field names for comparison
              const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
              const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
              const addrPincode = addr.pincode || '';

              const isDuplicate = addresses.some(existing => {
                const existingHouseNumber = existing.houseNumber || existing.flatOrHouseNo || '';
                const existingAreaStreet = existing.areaStreet || existing.areaOrStreet || '';
                const existingPincode = existing.pincode || '';

                return existingPincode === addrPincode &&
                  existingHouseNumber === addrHouseNumber &&
                  existingAreaStreet === addrAreaStreet;
              });

              if (!isDuplicate) {
                // Normalize the address object before adding
                const normalizedAddr = {
                  ...addr,
                  houseNumber: addr.houseNumber || addr.flatOrHouseNo || '',
                  areaStreet: addr.areaStreet || addr.areaOrStreet || '',
                  source: 'localStorage'
                };
                addresses.push(normalizedAddr);
                console.log('ConfirmOrder: Added address from localStorage array:', normalizedAddr);
              }
            });
          }
        }

        // Also check 'savedAddresses' key (legacy/alternative storage)
        const savedAddressesStr = localStorage.getItem('savedAddresses');
        if (savedAddressesStr) {
          const parsedAddresses = JSON.parse(savedAddressesStr);
          if (Array.isArray(parsedAddresses)) {
            console.log('ConfirmOrder: Found savedAddresses array in localStorage:', parsedAddresses.length, 'addresses');

            parsedAddresses.forEach(addr => {
              // Normalize field names for comparison
              const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
              const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
              const addrPincode = addr.pincode || '';

              const isDuplicate = addresses.some(existing => {
                const existingHouseNumber = existing.houseNumber || existing.flatOrHouseNo || '';
                const existingAreaStreet = existing.areaStreet || existing.areaOrStreet || '';
                const existingPincode = existing.pincode || '';

                return existingPincode === addrPincode &&
                  existingHouseNumber === addrHouseNumber &&
                  existingAreaStreet === addrAreaStreet;
              });

              if (!isDuplicate) {
                // Normalize the address object before adding
                const normalizedAddr = {
                  ...addr,
                  houseNumber: addr.houseNumber || addr.flatOrHouseNo || '',
                  areaStreet: addr.areaStreet || addr.areaOrStreet || '',
                  source: 'localStorage'
                };
                addresses.push(normalizedAddr);
              }
            });
          }
        }
      } catch (e) {
        console.error('ConfirmOrder: Error loading saved addresses array:', e);
      }

      console.log('ConfirmOrder: Total addresses loaded:', addresses.length);
      console.log('ConfirmOrder: Addresses:', addresses);

      // Debug: Check what's in localStorage
      console.log('ConfirmOrder: localStorage.getItem("addresses"):', localStorage.getItem('addresses'));
      console.log('ConfirmOrder: localStorage.getItem("selectedAddress"):', localStorage.getItem('selectedAddress'));
      console.log('ConfirmOrder: localStorage.getItem("savedAddresses"):', localStorage.getItem('savedAddresses'));

      // Ensure current address is in the addresses list if it exists
      if (address && addresses.length > 0) {
        const currentHouseNumber = address.houseNumber || address.flatOrHouseNo || '';
        const currentAreaStreet = address.areaStreet || address.areaOrStreet || '';
        const currentPincode = address.pincode || '';

        const isCurrentInList = addresses.some(addr => {
          const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
          const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
          const addrPincode = addr.pincode || '';

          return currentPincode === addrPincode &&
            currentHouseNumber === addrHouseNumber &&
            currentAreaStreet === addrAreaStreet;
        });

        if (!isCurrentInList) {
          console.log('ConfirmOrder: Current address not in list, adding it');
          addresses.push({ ...address, source: 'current' });
        }
      }

      // Check if current address matches database address (already saved)
      if (address && isAuthenticated && user?.phone) {
        const dbAddress = addresses.find(addr => addr.source === 'database');
        if (dbAddress) {
          const currentHouseNumber = address.houseNumber || address.flatOrHouseNo || '';
          const currentAreaStreet = address.areaStreet || address.areaOrStreet || '';
          const currentPincode = address.pincode || '';

          const dbHouseNumber = dbAddress.houseNumber || dbAddress.flatOrHouseNo || '';
          const dbAreaStreet = dbAddress.areaStreet || dbAddress.areaOrStreet || '';
          const dbPincode = dbAddress.pincode || '';

          if (currentPincode === dbPincode &&
            currentHouseNumber === dbHouseNumber &&
            currentAreaStreet === dbAreaStreet) {
            console.log('ConfirmOrder: Current address matches database address - already saved');
            setIsAddressSaved(true);
          }
        }
      }

      // Set saved addresses state
      setSavedAddresses(addresses);

      // If we have addresses but no current address is set, set the first one
      if (addresses.length > 0 && !address) {
        console.log('ConfirmOrder: Setting first address as current:', addresses[0]);
        const firstAddress = addresses[0];
        setAddress(firstAddress);
        // If address is from database/saved/order history, mark as saved
        if (firstAddress.isSaved || firstAddress.source === 'database' || firstAddress.source === 'saved' || firstAddress.source === 'order_history') {
          setIsAddressSaved(true);
        }
      }

      // If current address exists and is from saved sources, mark as saved
      if (address) {
        const currentHouseNumber = address.houseNumber || address.flatOrHouseNo || '';
        const currentAreaStreet = address.areaStreet || address.areaOrStreet || '';
        const currentPincode = address.pincode || '';

        const isFromSavedSource = addresses.some(addr => {
          const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
          const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
          const addrPincode = addr.pincode || '';

          return addrPincode === currentPincode &&
            addrHouseNumber === currentHouseNumber &&
            addrAreaStreet === currentAreaStreet &&
            (addr.isSaved || addr.source === 'database' || addr.source === 'saved' || addr.source === 'order_history');
        });

        if (isFromSavedSource) {
          setIsAddressSaved(true);
        }
      }

      if (addresses.length === 0) {
        console.log('ConfirmOrder: No addresses found');
        console.log('ConfirmOrder: Debug - isAuthenticated:', isAuthenticated, 'user:', user);
      } else {
        console.log('ConfirmOrder: Found', addresses.length, 'address(es). Current address:', address);
        console.log('ConfirmOrder: savedAddresses state will be set to:', addresses);
      }

      setIsLoading(false);
    };

    loadAddresses();
  }, [location.state, isAuthenticated, user]);

  // Automatically update address in database when it changes from checkout
  useEffect(() => {
    const autoUpdateAddress = async () => {
      // Only auto-update if:
      // 1. User is authenticated
      // 2. Address exists and came from checkout (source: 'current')
      // 3. Address is not already saved
      // 4. Not currently saving/updating
      if (!isAuthenticated || !user || !address || address.source !== 'current' || isAddressSaved || isSavingAddress) {
        return;
      }

      const userPhone = user.phone;
      if (!userPhone) {
        return;
      }

      // Validate address fields
      if (!address.pincode || !address.houseNumber || !address.areaStreet || !address.city || !address.state) {
        return;
      }

      // Create a unique key for this address to prevent duplicate updates
      const addressKey = `${address.pincode}-${address.houseNumber || address.flatOrHouseNo}-${address.areaStreet || address.areaOrStreet}`;

      // Check if we've already attempted to update this address
      if (autoUpdateAttempted.current.has(addressKey)) {
        return;
      }

      // Mark this address as attempted
      autoUpdateAttempted.current.add(addressKey);

      // Check if address is different from database address
      try {
        const token = user.token || localStorage.getItem('authToken');
        const userData = await getUserByPhone(user.phone, token);

        if (userData && (userData.pincode || userData.flatOrHouseNo || userData.areaOrStreet)) {
          const dbPincode = userData.pincode || '';
          const dbHouseNumber = userData.flatOrHouseNo || '';
          const dbAreaStreet = userData.areaOrStreet || '';

          const currentPincode = address.pincode || '';
          const currentHouseNumber = address.houseNumber || address.flatOrHouseNo || '';
          const currentAreaStreet = address.areaStreet || address.areaOrStreet || '';

          // Check if address is different from database
          const isDifferent =
            dbPincode !== currentPincode ||
            dbHouseNumber !== currentHouseNumber ||
            dbAreaStreet !== currentAreaStreet;

          if (isDifferent) {
            console.log('🔄 Address changed, automatically updating in database...');
            setIsSavingAddress(true);

            try {
              // Map address to database fields
              const addressData = {
                fullName: address.customerName || user.fullName || '',
                phone: userPhone,
                email: address.emailId || user.email || null,
                pincode: address.pincode,
                flatOrHouseNo: address.houseNumber || address.flatOrHouseNo || '',
                areaOrStreet: address.areaStreet || address.areaOrStreet || '',
                landmark: address.landmark || null,
                city: address.city || '',
                state: address.state || '',
                addressType: address.addressType || 'Other',
                whatsappUpdates: true
              };

              const updatedUser = await updateUserAddressByPhone(userPhone, addressData, token);

              console.log('✅ Address automatically updated in database:', updatedUser);

              // Refresh user object
              if (updatedUser && refreshUser) {
                try {
                  await refreshUser(updatedUser.id, userPhone);
                } catch (refreshError) {
                  console.warn('Could not refresh user object:', refreshError);
                }
              }

              // Update current address with database response
              const updatedAddress = {
                ...address,
                customerName: updatedUser.fullName || address.customerName,
                emailId: updatedUser.email || address.emailId,
                source: 'database',
                isSaved: true,
                updatedAt: new Date().toISOString()
              };

              setAddress(updatedAddress);
              localStorage.setItem('selectedAddress', JSON.stringify(updatedAddress));

              // Update in saved addresses list
              const userAddressesKey = `userAddresses_${userPhone}`;
              const existingAddresses = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');
              const addressKey = `${address.pincode}-${address.houseNumber || address.flatOrHouseNo}-${address.areaStreet || address.areaOrStreet}`;

              const updatedSavedAddresses = existingAddresses.map(addr => {
                const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
                if (addrKey === addressKey) {
                  return updatedAddress;
                }
                return addr;
              });

              // If address wasn't in saved list, add it
              if (!existingAddresses.some(addr => {
                const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
                return addrKey === addressKey;
              })) {
                updatedSavedAddresses.push(updatedAddress);
              }

              localStorage.setItem(userAddressesKey, JSON.stringify(updatedSavedAddresses));

              // Update saved addresses state
              setSavedAddresses(prev => {
                const updated = prev.map(addr => {
                  const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
                  const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
                  const addrPincode = addr.pincode || '';

                  if (addrPincode === address.pincode &&
                    addrHouseNumber === (address.houseNumber || address.flatOrHouseNo) &&
                    addrAreaStreet === (address.areaStreet || address.areaOrStreet)) {
                    return updatedAddress;
                  }
                  return addr;
                });

                // If address wasn't in state, add it
                if (!updated.some(addr => {
                  const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
                  const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
                  const addrPincode = addr.pincode || '';

                  return addrPincode === address.pincode &&
                    addrHouseNumber === (address.houseNumber || address.flatOrHouseNo) &&
                    addrAreaStreet === (address.areaStreet || address.areaOrStreet);
                })) {
                  updated.push(updatedAddress);
                }

                return updated;
              });

              setIsAddressSaved(true);
              console.log('✅ Address automatically updated and marked as saved');
            } catch (error) {
              console.error('Error auto-updating address:', error);
              // Remove from attempted set so we can retry if needed
              autoUpdateAttempted.current.delete(addressKey);
              // Don't show alert for auto-update failures, just log
              // User can still proceed with the address
            } finally {
              setIsSavingAddress(false);
            }
          } else {
            // Address matches database, mark as saved
            setIsAddressSaved(true);
            // Remove from attempted set since no update was needed
            autoUpdateAttempted.current.delete(addressKey);
          }
        } else {
          // No database address found, remove from attempted set
          autoUpdateAttempted.current.delete(addressKey);
        }
      } catch (error) {
        console.error('Error checking database address:', error);
        // Remove from attempted set so we can retry if needed
        autoUpdateAttempted.current.delete(addressKey);
        // If we can't check, don't auto-update
      }
    };

    // Add a small delay to ensure address state is set
    const timer = setTimeout(() => {
      autoUpdateAddress();
    }, 500);

    return () => clearTimeout(timer);
  }, [address, isAuthenticated, user, isAddressSaved, isSavingAddress, refreshUser]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const cartPath = getRoute(ROUTES.CART, resolvedSlug);
      navigate(cartPath);
    }
  }, [cart, storeSlug, currentStore, navigate]);

  // Load Razorpay script
  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      // Script exists but might not be loaded yet, wait for it
      const checkScript = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkScript);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScript);
      }, 10000);

      return () => clearInterval(checkScript);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };

    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Redirect if no address (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !address && cart.length > 0) {
      console.log('ConfirmOrder: No address found, redirecting to checkout');
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const checkoutPath = getRoute(ROUTES.CHECKOUT, resolvedSlug);
      navigate(checkoutPath);
    }
  }, [isLoading, address, cart, storeSlug, currentStore, navigate]);

  const formatAddress = () => {
    if (!address) return '';
    const parts = [
      address.customerName,
      address.houseNumber || address.flatOrHouseNo,
      address.areaStreet || address.areaOrStreet,
      address.landmark,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleRazorpayPayment = async (orderId) => {
    // Wait for Razorpay script to load if not already loaded
    if (!window.Razorpay) {
      // Wait up to 5 seconds for script to load
      let attempts = 0;
      while (!window.Razorpay && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded yet. Please refresh the page and try again.');
      }
    }

    const API_BASE = getBackendUrl();
    const amount = orderTotal;

    try {
      // Step 1: Create Razorpay order on backend
      // Backend PaymentController is mapped to /api/payment
      let createOrderApi = `${API_BASE}/api/payment/create-razorpay-order`;
      console.log('Creating Razorpay order:', { url: createOrderApi, orderId, amount });

      let orderResponse = await fetch(createOrderApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          amount: Number(amount),
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Razorpay order creation failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorText,
          url: createOrderApi
        });
        throw new Error(`Failed to create Razorpay order (${orderResponse.status}): ${errorText || orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();
      if (!orderData.razorpayOrderId) {
        console.error('Invalid response from backend:', orderData);
        throw new Error('Backend did not return razorpayOrderId. Response: ' + JSON.stringify(orderData));
      }

      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount * 100, // paise
        currency: 'INR',
        name: currentStore?.storeName || 'Store',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 2: Verify payment with backend
            // Backend PaymentController is mapped to /api/payment
            let callbackUrl = `${API_BASE}/api/payment/razorpay-callback`;
            console.log('Verifying payment:', { url: callbackUrl, orderId });

            let callbackResponse = await fetch(callbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: Number(orderId),
                amount: Number(amount),
              }),
            });

            if (!callbackResponse.ok) {
              const errorText = await callbackResponse.text();
              console.error('Payment verification failed:', {
                status: callbackResponse.status,
                statusText: callbackResponse.statusText,
                error: errorText,
                url: callbackUrl
              });
              throw new Error(`Payment verification failed (${callbackResponse.status}): ${errorText || callbackResponse.statusText}`);
            }

            const callbackData = await callbackResponse.json();
            console.log('Payment verified:', callbackData);

            // Navigate to success page
            const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
            const successPath = getRoute(ROUTES.ORDER_SUCCESS, resolvedSlug);
            navigate(successPath, {
              state: {
                orderId: orderId,
                address: address,
                contactInfo: {
                  phone: address.mobileNumber || user.phone,
                  email: address.emailId || user.email
                }
              }
            });
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(`Payment succeeded but verification failed: ${err.message}`);
            setIsProcessingPayment(false);
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setIsProcessingPayment(false);
            setIsPlacingOrder(false);
            setError('Payment was cancelled. You can try again.');

            // Mark payment as FAILED in database
            try {
              const API_BASE = getBackendUrl();
              const markFailedUrl = `${API_BASE}/payment/mark-failed`;
              console.log('Marking payment as failed:', { url: markFailedUrl, orderId });

              let response = await fetch(markFailedUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: Number(orderId),
                }),
              });

              // Try with /api prefix if 404
              if (response.status === 404 || response.status === 0) {
                console.log('Trying mark-failed with /api prefix...');
                const apiUrl = `${API_BASE}/api/payment/mark-failed`;
                response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: Number(orderId),
                  }),
                });
              }

              if (response.ok) {
                console.log('✅ Payment marked as FAILED in database');
              } else {
                const errorText = await response.text();
                console.warn('⚠️ Could not mark payment as failed:', response.status, errorText);
              }
            } catch (err) {
              console.error('Error marking payment as failed:', err);
              // Don't show error to user, payment cancellation is already handled
            }
          },
        },
        theme: { color: '#ff6d2e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      // Show more detailed error message
      const errorMessage = error.message || 'Failed to initiate Razorpay payment. Please check your backend server is running on port 8080.';
      throw new Error(errorMessage);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      alert('Please login to place an order');
      // Note: Login route doesn't exist in this app, redirect to home instead
      navigate(getRoute(ROUTES.HOME, storeSlug));
      return;
    }

    if (!address) {
      alert('Please provide a delivery address');
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const checkoutPath = getRoute(ROUTES.CHECKOUT, resolvedSlug);
      navigate(checkoutPath);
      return;
    }

    setIsPlacingOrder(true);
    setError('');

    try {
      const formattedAddress = formatAddress();
      const mobileNumber = address.mobileNumber || user.phone;

      if (!mobileNumber) {
        throw new Error('Mobile number is required');
      }

      // Convert mobile number to number (remove +91 if present, remove spaces)
      const mobileNum = parseInt(mobileNumber.toString().replace(/\+91|\s/g, ''), 10);
      if (isNaN(mobileNum)) {
        throw new Error('Invalid mobile number');
      }

      // Get storeId from multiple sources to ensure it's not null
      let storeId = currentStore?.storeId || currentStore?.id || null;

      // Try to get storeId from cart items if currentStore doesn't have it
      if (!storeId && cart.length > 0) {
        storeId = cart[0]?.storeId || null;
      }

      // Try to get storeId from StoreContext's getStoreId method
      if (!storeId && getStoreId) {
        storeId = getStoreId() || null;
      }

      // If we have a storeSlug but no storeId, fetch the store to get storeId
      if (!storeId && storeSlug) {
        try {
          console.log('Fetching store by slug to get storeId:', storeSlug);
          const store = await getStoreBySlug(storeSlug);
          storeId = store?.storeId || store?.id || null;
          console.log('Retrieved storeId from store slug:', storeId);
        } catch (e) {
          console.warn('Could not fetch store by slug:', e);
        }
      }

      // Ensure sellerId is a number, not a string
      let sellerId = cart[0]?.sellerId || null;
      if (sellerId) {
        sellerId = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
        if (isNaN(sellerId)) {
          sellerId = null;
        }
      }

      // Validate storeId is not null before proceeding
      if (!storeId) {
        throw new Error('Store ID is required to place an order. Please ensure you are shopping from a valid store page.');
      }

      console.log('Placing order with:', {
        userId: user.userId || user.id,
        address: formattedAddress,
        mobile: mobileNum,
        storeId,
        sellerId,
        paymentMethod,
        cartItems: cart.length
      });

      // Validate cart is not empty
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty. Please add items to cart before placing an order.');
      }

      // Ensure cart exists in backend and sync items before placing order
      try {
        console.log('Ensuring cart exists in backend for user:', user.userId || user.id);
        const backendCart = await getCart(user.userId || user.id);
        console.log('Backend cart verified:', backendCart);

        // Extract storeId from backend cart if we don't have it yet
        if (!storeId && backendCart?.storeId) {
          storeId = backendCart.storeId;
          console.log('Found storeId from backend cart:', storeId);
        }

        // If still no storeId, try to extract from cart items' products
        if (!storeId && backendItems.length > 0) {
          const firstItem = backendItems[0];
          // Products might have storeId through seller relationship
          // But since Product model doesn't have direct storeId, we'll rely on other sources
          console.log('Checking cart items for storeId...');
        }

        // Check if backend cart has items
        const backendItems = backendCart?.items || backendCart?.orderItems || [];
        console.log('Backend cart items count:', backendItems.length, 'Frontend cart items count:', cart.length);

        // If backend cart is empty but frontend has items, sync them
        if (backendItems.length === 0 && cart.length > 0) {
          console.log('Backend cart is empty, syncing frontend cart items to backend...');
          let syncedCount = 0;

          for (const item of cart) {
            const productId = item.productId || item.id;
            const quantity = item.quantity || 1;
            if (productId) {
              try {
                await addToCartAPI(user.userId || user.id, productId, quantity);
                console.log('Synced item to backend:', { productId, quantity });
                syncedCount++;
                // Small delay to avoid overwhelming backend
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (syncError) {
                console.error('Error syncing item to backend:', syncError);
                // Try one more time
                try {
                  await new Promise(resolve => setTimeout(resolve, 500));
                  await addToCartAPI(user.userId || user.id, productId, quantity);
                  console.log('Retry successful for item:', { productId, quantity });
                  syncedCount++;
                } catch (retryError) {
                  console.error('Retry failed for item:', retryError);
                }
              }
            }
          }

          console.log(`Synced ${syncedCount} out of ${cart.length} items to backend`);

          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));

          // Verify cart again after syncing
          const updatedBackendCart = await getCart(user.userId || user.id);
          const updatedItems = updatedBackendCart?.items || updatedBackendCart?.orderItems || [];

          // Try to get storeId from updated backend cart
          if (!storeId && updatedBackendCart?.storeId) {
            storeId = updatedBackendCart.storeId;
            console.log('Found storeId from updated backend cart:', storeId);
          }

          if (updatedItems.length === 0) {
            console.error('❌ Cart sync failed - backend cart is still empty after sync attempt');
            throw new Error(`Failed to sync cart items to backend. Synced ${syncedCount} items but backend cart is still empty. Please try refreshing the page and adding items to cart again.`);
          }
          console.log('✅ Cart items synced successfully. Backend now has', updatedItems.length, 'items');
        } else if (backendItems.length === 0) {
          throw new Error('Your cart is empty. Please add items to cart before placing an order.');
        }
      } catch (cartError) {
        console.error('Error verifying/syncing cart:', cartError);

        // Check if it's a connection error
        if (cartError.message && (cartError.message.includes('Failed to fetch') || cartError.message.includes('NetworkError') || cartError.message.includes('ERR_CONNECTION_REFUSED') || cartError.message.includes('Cannot connect to server'))) {
          throw new Error('Cannot connect to backend server. Please ensure the server is running on port 8080.');
        }

        // Re-throw other errors
        throw cartError;
      }

      // Final validation: storeId must not be null
      if (!storeId) {
        throw new Error('Store ID is required to place an order. Please ensure you are shopping from a valid store page.');
      }

      // Ensure storeId is a number, not a string
      if (typeof storeId === 'string') {
        storeId = parseInt(storeId, 10);
        if (isNaN(storeId)) {
          throw new Error('Invalid Store ID. Please ensure you are shopping from a valid store page.');
        }
      }

      // CRITICAL: Save email to database BEFORE placing order if email was provided in address
      if (address && address.emailId && address.emailId.trim() !== '') {
        console.log('📧 Saving email to database before placing order:', address.emailId);
        try {
          const userPhone = user.phone;
          if (userPhone) {
            const addressData = {
              email: address.emailId.trim(),
              phone: userPhone
            };
            const token = user.token || localStorage.getItem('authToken');
            await updateUserAddressByPhone(userPhone, addressData, token);
            console.log('✅ Email saved to database before placing order');

            // Refresh user object to get latest email
            if (refreshUser) {
              await refreshUser(user.userId || user.id, userPhone);
              console.log('✅ User object refreshed with new email');
            }
          }
        } catch (emailError) {
          console.warn('⚠️ Could not save email before placing order:', emailError);
          // Continue with order placement even if email save fails
        }
      }

      // Get token for authentication
      let token = user?.token || localStorage.getItem('authToken');
      if (!token) {
        // Try to get from currentUser in localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            token = parsedUser?.token;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      // First, place the order
      const order = await placeOrder(
        user.userId || user.id,
        formattedAddress,
        mobileNum,
        storeId,
        sellerId,
        token
      );

      console.log('Order placed successfully:', order);
      console.log('Order object keys:', Object.keys(order));
      console.log('Order.OrdersId:', order.OrdersId);
      console.log('Order.ordersId:', order.ordersId);
      console.log('Order.id:', order.id);

      // Backend uses @JsonProperty("OrdersId") so the field is "OrdersId" (capital O, capital I)
      const orderId = order.OrdersId || order.ordersId || order.id || order.orderId;

      if (!orderId) {
        console.error('❌ Could not find order ID in order object:', order);
        throw new Error('Order ID not found in response. Please check backend logs.');
      }

      console.log('✅ Using order ID:', orderId, '(type:', typeof orderId, ')');

      // If Razorpay, initiate payment
      if (paymentMethod === 'RAZORPAY') {
        setIsProcessingPayment(true);
        await handleRazorpayPayment(orderId);
        return; // Don't navigate yet, wait for payment callback
      }

      // For COD, navigate directly to success page
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const successPath = resolvedSlug ? `/store/${resolvedSlug}/order/success` : '/order/success';
      navigate(successPath, {
        state: {
          orderId: orderId,
          address: address,
          contactInfo: {
            phone: mobileNumber,
            email: address.emailId || user.email
          }
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error stack:', error.stack);

      // Provide user-friendly error messages
      let errorMessage = error.message || 'Failed to place order. Please try again.';

      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = '⚠️ Backend server is not running!\n\nPlease start the backend server on port 8080 and try again.\n\nTo start the server:\n1. Navigate to the Backend directory\n2. Run: mvn spring-boot:run\n3. Wait for server to start\n4. Try placing the order again';
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 8080.';
      } else if (error.message && error.message.includes('Server error:')) {
        // Keep the server error message as-is, it already has details
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsPlacingOrder(false);
      setIsProcessingPayment(false);
    }
  };

  const handleChangeAddress = () => {
    const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
    const checkoutPath = resolvedSlug ? `/store/${resolvedSlug}/checkout` : '/checkout';
    // Pass current address to checkout so it can be pre-filled
    navigate(checkoutPath, { state: { currentAddress: address } });
  };

  const handleUpdateAddress = async () => {
    if (!address || !isAuthenticated || !user) {
      alert('Please login to update your address');
      return;
    }

    const userPhone = user.phone;
    if (!userPhone) {
      alert('User phone number not found. Please login again.');
      return;
    }

    // Validate address fields
    if (!address.pincode || !address.houseNumber || !address.areaStreet || !address.city || !address.state) {
      alert('Please ensure all address fields are filled (Pincode, House Number, Area, City, State)');
      return;
    }

    setIsSavingAddress(true);
    setError('');

    try {
      // Map address to database fields
      const addressData = {
        fullName: address.customerName || user.fullName || '',
        phone: userPhone,
        email: address.emailId || user.email || null,
        pincode: address.pincode,
        flatOrHouseNo: address.houseNumber || address.flatOrHouseNo || '',
        areaOrStreet: address.areaStreet || address.areaOrStreet || '',
        landmark: address.landmark || null,
        city: address.city || '',
        state: address.state || '',
        addressType: address.addressType || 'Other',
        whatsappUpdates: true
      };

      console.log('Updating address in database:', addressData);

      const token = user.token || localStorage.getItem('authToken');
      const updatedUser = await updateUserAddressByPhone(userPhone, addressData, token);

      console.log('Address updated successfully:', updatedUser);
      console.log('📧 Updated email in response:', updatedUser.email);

      // Refresh user object in AuthContext and localStorage
      if (updatedUser && updatedUser.email) {
        try {
          if (refreshUser) {
            await refreshUser(updatedUser.id, userPhone);
            console.log('✅ User object refreshed with new email');
          } else {
            // Manually update user object if refreshUser is not available
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUserObj = {
              ...currentUser,
              email: updatedUser.email,
              fullName: updatedUser.fullName || currentUser.fullName,
              ...updatedUser
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUserObj));
            console.log('✅ User object manually updated with new email:', updatedUserObj.email);
          }
        } catch (refreshError) {
          console.warn('Could not refresh user object:', refreshError);
          // Fallback: manually update user object
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updatedUserObj = {
            ...currentUser,
            email: updatedUser.email,
            fullName: updatedUser.fullName || currentUser.fullName,
            ...updatedUser
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUserObj));
          console.log('✅ User object manually updated (fallback) with new email:', updatedUserObj.email);
        }
      }

      // Update current address with database response
      const updatedAddress = {
        ...address,
        customerName: updatedUser.fullName || address.customerName,
        emailId: updatedUser.email || address.emailId,
        source: 'database',
        isSaved: true,
        updatedAt: new Date().toISOString()
      };

      setAddress(updatedAddress);
      localStorage.setItem('selectedAddress', JSON.stringify(updatedAddress));

      // Update in saved addresses list if it exists there
      const userAddressesKey = `userAddresses_${userPhone}`;
      const existingAddresses = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');
      const addressKey = `${address.pincode}-${address.houseNumber || address.flatOrHouseNo}-${address.areaStreet || address.areaOrStreet}`;

      const updatedSavedAddresses = existingAddresses.map(addr => {
        const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
        if (addrKey === addressKey) {
          return updatedAddress;
        }
        return addr;
      });

      // If address wasn't in saved list, add it
      if (!existingAddresses.some(addr => {
        const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
        return addrKey === addressKey;
      })) {
        updatedSavedAddresses.push(updatedAddress);
      }

      localStorage.setItem(userAddressesKey, JSON.stringify(updatedSavedAddresses));

      // Update saved addresses state
      const allAddresses = savedAddresses.map(addr => {
        const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
        const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
        const addrPincode = addr.pincode || '';

        if (addrPincode === address.pincode &&
          addrHouseNumber === (address.houseNumber || address.flatOrHouseNo) &&
          addrAreaStreet === (address.areaStreet || address.areaOrStreet)) {
          return updatedAddress;
        }
        return addr;
      });

      // If address wasn't in state, add it
      if (!allAddresses.some(addr => {
        const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
        const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
        const addrPincode = addr.pincode || '';

        return addrPincode === address.pincode &&
          addrHouseNumber === (address.houseNumber || address.flatOrHouseNo) &&
          addrAreaStreet === (address.areaStreet || address.areaOrStreet);
      })) {
        allAddresses.push(updatedAddress);
      }

      setSavedAddresses(allAddresses);
      setIsAddressSaved(true);

      alert('✅ Address updated successfully in database!');
    } catch (error) {
      console.error('Error updating address:', error);
      let errorMessage = error.message || 'Failed to update address. Please try again.';

      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 8080.';
      }

      setError(errorMessage);
      alert(`Failed to update address: ${errorMessage}`);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!address || !isAuthenticated || !user) {
      alert('Please login to save your address');
      return;
    }

    const userPhone = user.phone;
    if (!userPhone) {
      alert('User phone number not found. Please login again.');
      return;
    }

    // Validate address fields
    if (!address.pincode || !address.houseNumber || !address.areaStreet || !address.city || !address.state) {
      alert('Please ensure all address fields are filled (Pincode, House Number, Area, City, State)');
      return;
    }

    // Check if user already has 5 addresses saved
    const userAddressesKey = `userAddresses_${userPhone}`;
    const existingAddresses = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');

    if (existingAddresses.length >= 5) {
      alert('You can only save up to 5 addresses. Please delete an existing address first.');
      return;
    }

    setIsSavingAddress(true);
    setError('');

    try {
      // Map address to database fields
      const addressData = {
        fullName: address.customerName || user.fullName || '',
        phone: userPhone,
        email: address.emailId || user.email || null,
        pincode: address.pincode,
        flatOrHouseNo: address.houseNumber || address.flatOrHouseNo || '',
        areaOrStreet: address.areaStreet || address.areaOrStreet || '',
        landmark: address.landmark || null,
        city: address.city || '',
        state: address.state || '',
        addressType: address.addressType || 'Other',
        whatsappUpdates: true
      };

      console.log('Saving address to database:', addressData);

      const token = user.token || localStorage.getItem('authToken');
      const updatedUser = await updateUserAddressByPhone(userPhone, addressData, token);

      console.log('Address saved successfully:', updatedUser);
      console.log('📧 Updated email in response:', updatedUser.email);

      // Refresh user object in AuthContext and localStorage
      if (updatedUser && updatedUser.email) {
        try {
          if (refreshUser) {
            await refreshUser(updatedUser.id, userPhone);
            console.log('✅ User object refreshed with new email');
          } else {
            // Manually update user object if refreshUser is not available
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUserObj = {
              ...currentUser,
              email: updatedUser.email,
              fullName: updatedUser.fullName || currentUser.fullName,
              ...updatedUser
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUserObj));
            console.log('✅ User object manually updated with new email:', updatedUserObj.email);
          }
        } catch (refreshError) {
          console.warn('Could not refresh user object:', refreshError);
          // Fallback: manually update user object
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updatedUserObj = {
            ...currentUser,
            email: updatedUser.email,
            fullName: updatedUser.fullName || currentUser.fullName,
            ...updatedUser
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUserObj));
          console.log('✅ User object manually updated (fallback) with new email:', updatedUserObj.email);
        }
      }

      // Create saved address object with unique ID
      const savedAddress = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        customerName: updatedUser.fullName || address.customerName,
        emailId: updatedUser.email || address.emailId,
        source: 'database',
        savedAt: new Date().toISOString()
      };

      // Check if this address already exists in saved addresses
      const addressKey = `${savedAddress.pincode}-${savedAddress.houseNumber || savedAddress.flatOrHouseNo}-${savedAddress.areaStreet || savedAddress.areaOrStreet}`;
      const isDuplicate = existingAddresses.some(addr => {
        const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
        return addrKey === addressKey;
      });

      if (isDuplicate) {
        alert('This address is already saved!');
        setIsSavingAddress(false);
        return;
      }

      // Add to saved addresses list (limit 5)
      const updatedSavedAddresses = [...existingAddresses, savedAddress];
      localStorage.setItem(userAddressesKey, JSON.stringify(updatedSavedAddresses));

      // Update current address
      setAddress(savedAddress);
      localStorage.setItem('selectedAddress', JSON.stringify(savedAddress));

      // Update saved addresses state
      const allAddresses = [...savedAddresses];
      if (!allAddresses.some(addr => {
        const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
        const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
        const addrPincode = addr.pincode || '';

        return addrPincode === savedAddress.pincode &&
          addrHouseNumber === (savedAddress.houseNumber || savedAddress.flatOrHouseNo) &&
          addrAreaStreet === (savedAddress.areaStreet || savedAddress.areaOrStreet);
      })) {
        allAddresses.push(savedAddress);
      }

      setSavedAddresses(allAddresses);
      setIsAddressSaved(true);

      alert(`✅ Address saved successfully! (${updatedSavedAddresses.length}/5 addresses saved)`);
    } catch (error) {
      console.error('Error saving address:', error);
      let errorMessage = error.message || 'Failed to save address. Please try again.';

      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 8080.';
      }

      setError(errorMessage);
      alert(`Failed to save address: ${errorMessage}`);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = (addressToDelete) => {
    if (!isAuthenticated || !user) {
      alert('Please login to delete addresses');
      return;
    }

    const userPhone = user.phone;
    if (!userPhone) {
      alert('User phone number not found. Please login again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    const userAddressesKey = `userAddresses_${userPhone}`;
    const existingAddresses = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');

    // Remove the address
    const updatedAddresses = existingAddresses.filter(addr => {
      // Match by ID if available, otherwise match by address details
      if (addressToDelete.id && addr.id) {
        return addr.id !== addressToDelete.id;
      }

      const addrKey = `${addr.pincode}-${addr.houseNumber || addr.flatOrHouseNo}-${addr.areaStreet || addr.areaOrStreet}`;
      const deleteKey = `${addressToDelete.pincode}-${addressToDelete.houseNumber || addressToDelete.flatOrHouseNo}-${addressToDelete.areaStreet || addressToDelete.areaOrStreet}`;
      return addrKey !== deleteKey;
    });

    localStorage.setItem(userAddressesKey, JSON.stringify(updatedAddresses));

    // Update saved addresses state
    const updatedSavedAddresses = savedAddresses.filter(addr => {
      if (addressToDelete.id && addr.id) {
        return addr.id !== addressToDelete.id;
      }

      const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
      const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
      const addrPincode = addr.pincode || '';

      const deleteHouseNumber = addressToDelete.houseNumber || addressToDelete.flatOrHouseNo || '';
      const deleteAreaStreet = addressToDelete.areaStreet || addressToDelete.areaOrStreet || '';
      const deletePincode = addressToDelete.pincode || '';

      return !(addrPincode === deletePincode &&
        addrHouseNumber === deleteHouseNumber &&
        addrAreaStreet === deleteAreaStreet);
    });

    setSavedAddresses(updatedSavedAddresses);

    // If deleted address was the current address, set first available address or null
    const currentHouseNumber = address?.houseNumber || address?.flatOrHouseNo || '';
    const currentAreaStreet = address?.areaStreet || address?.areaOrStreet || '';
    const currentPincode = address?.pincode || '';

    const deleteHouseNumber = addressToDelete.houseNumber || addressToDelete.flatOrHouseNo || '';
    const deleteAreaStreet = addressToDelete.areaStreet || addressToDelete.areaOrStreet || '';
    const deletePincode = addressToDelete.pincode || '';

    if (currentPincode === deletePincode &&
      currentHouseNumber === deleteHouseNumber &&
      currentAreaStreet === deleteAreaStreet) {
      // Set first available address or null
      if (updatedSavedAddresses.length > 0) {
        setAddress(updatedSavedAddresses[0]);
        localStorage.setItem('selectedAddress', JSON.stringify(updatedSavedAddresses[0]));
      } else {
        setAddress(null);
        localStorage.removeItem('selectedAddress');
      }
      setIsAddressSaved(false);
    }

    alert('Address deleted successfully!');
  };

  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
  const isMobile = window.innerWidth <= 968;

  // Show loading state while checking address and cart
  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: isDarkMode ? '#f5f5f5' : '#111' }}>Loading...</div>
      </div>
    );
  }

  // Will redirect if no address or empty cart
  if (!address || cart.length === 0) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: isDarkMode ? '#f5f5f5' : '#111',
        marginBottom: '2rem'
      }}>
        Confirm Order
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
        gap: '24px'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Address */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Shipping Address
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressList(!showAddressList)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                      borderRadius: '6px',
                      color: isDarkMode ? '#f5f5f5' : '#111',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#ff6d2e';
                      e.target.style.color = '#ff6d2e';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                      e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {showAddressList ? 'Hide' : `View All (${savedAddresses.length})`}
                  </button>
                )}
                <button
                  onClick={handleChangeAddress}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                    borderRadius: '6px',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#ff6d2e';
                    e.target.style.color = '#ff6d2e';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                    e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Change
                </button>
              </div>
            </div>

            {/* Show all saved addresses if toggle is on */}
            {showAddressList && savedAddresses.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedAddresses.map((addr, index) => {
                  // Normalize field names for comparison
                  const addrHouseNumber = addr.houseNumber || addr.flatOrHouseNo || '';
                  const addrAreaStreet = addr.areaStreet || addr.areaOrStreet || '';
                  const addrPincode = addr.pincode || '';

                  const currentHouseNumber = address?.houseNumber || address?.flatOrHouseNo || '';
                  const currentAreaStreet = address?.areaStreet || address?.areaOrStreet || '';
                  const currentPincode = address?.pincode || '';

                  const isSelected = address &&
                    currentPincode === addrPincode &&
                    currentHouseNumber === addrHouseNumber &&
                    currentAreaStreet === addrAreaStreet;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setAddress(addr);
                        localStorage.setItem('selectedAddress', JSON.stringify(addr));
                        setShowAddressList(false);
                        // Mark as saved since this is a saved address from database/localStorage/order history
                        // All addresses in savedAddresses list are from saved sources
                        setIsAddressSaved(true);
                      }}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                        background: isSelected ? (isDarkMode ? 'rgba(255,109,46,0.1)' : 'rgba(255,109,46,0.05)') : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#ff6d2e';
                          e.currentTarget.style.background = isDarkMode ? 'rgba(255,109,46,0.05)' : 'rgba(255,109,46,0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '600', color: isDarkMode ? '#f5f5f5' : '#111' }}>
                          {addr.customerName || 'Address'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {isSelected && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#ff6d2e',
                              color: '#fff',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              Selected
                            </span>
                          )}
                          {/* Delete button for saved addresses */}
                          {(addr.source === 'saved' || addr.source === 'database' || addr.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr);
                              }}
                              style={{
                                padding: '4px 8px',
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#c82333';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#dc3545';
                              }}
                              title="Delete address"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: isDarkMode ? '#ccc' : '#666', lineHeight: '1.6' }}>
                        {[(addr.houseNumber || addr.flatOrHouseNo), (addr.areaStreet || addr.areaOrStreet), addr.landmark].filter(Boolean).join(', ')}
                        {addr.city && `, ${addr.city}`}
                        {addr.state && `, ${addr.state}`}
                        {addr.pincode && ` - ${addr.pincode}`}
                      </div>
                      {addr.mobileNumber && (
                        <div style={{ fontSize: '0.85rem', color: isDarkMode ? '#999' : '#888', marginTop: '4px' }}>
                          📱 {addr.mobileNumber}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Selected Address - Only show when address list is NOT shown */}
            {address && !showAddressList && (
              <div style={{
                fontSize: '0.95rem',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                {address.customerName && (
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: isDarkMode ? '#f5f5f5' : '#111' }}>
                    {address.customerName}
                  </div>
                )}
                {formatAddress()}
                {address.mobileNumber && (
                  <div style={{ fontSize: '0.85rem', color: isDarkMode ? '#999' : '#888', marginTop: '4px' }}>
                    📱 {address.mobileNumber}
                  </div>
                )}
              </div>
            )}

            {/* Auto-updating indicator - Show when address is being automatically updated */}
            {address && !showAddressList && isAuthenticated && user && isSavingAddress && address.source === 'current' && (
              <div style={{
                padding: '12px',
                background: isDarkMode ? 'rgba(40, 167, 69, 0.1)' : '#d4edda',
                border: `1px solid ${isDarkMode ? 'rgba(40, 167, 69, 0.3)' : '#c3e6cb'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#90ee90' : '#155724',
                fontSize: '0.9rem',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Updating address in database...</span>
              </div>
            )}

            {/* Save Address Button - Only show for new addresses that aren't being auto-updated */}
            {address && !showAddressList && isAuthenticated && user && !isAddressSaved && address.source !== 'current' && (
              <div>
                {(() => {
                  const userAddressesKey = `userAddresses_${user.phone}`;
                  const existingAddresses = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');
                  const addressCount = existingAddresses.length;
                  const canSaveMore = addressCount < 5;

                  return (
                    <>
                      <button
                        onClick={handleSaveAddress}
                        disabled={isSavingAddress || !canSaveMore}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: (isSavingAddress || !canSaveMore) ? '#ccc' : '#ff6d2e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: (isSavingAddress || !canSaveMore) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s',
                          marginBottom: '8px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSavingAddress && canSaveMore) {
                            e.target.style.background = '#e55a1f';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 46, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSavingAddress && canSaveMore) {
                            e.target.style.background = '#ff6d2e';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {isSavingAddress ? 'Saving Address...' : canSaveMore ? `Save Address (${addressCount}/5)` : 'Maximum 5 addresses reached'}
                      </button>
                      {!canSaveMore && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#dc3545',
                          textAlign: 'center',
                          marginBottom: '8px'
                        }}>
                          You have reached the maximum of 5 saved addresses. Delete one to save a new address.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Address Saved Success Message */}
            {isAddressSaved && !showAddressList && (
              <div style={{
                padding: '12px',
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                color: '#155724',
                fontSize: '0.9rem',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Address saved successfully!
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h15v13H1zM16 8h4l3 3v11H16z"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Usually delivered in 3-5 Days</span>
            </div>
          </div>

          {/* Order Items */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Order Items
              </h3>
              <span style={{
                fontSize: '0.9rem',
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
              }}>
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => {
                const discount = item.originalPrice && item.price < item.originalPrice
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                return (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: isDarkMode ? '#0e0e0e' : '#f5f5f5'
                    }}>
                      <img
                        src={item.image || '/assets/products/p1.jpg'}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = '/assets/products/p1.jpg';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: isDarkMode ? '#f5f5f5' : '#111'
                      }}>
                        {item.name}
                      </div>
                      {item.color && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        }}>
                          {item.color}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: isDarkMode ? '#f5f5f5' : '#111'
                        }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                            <span style={{
                              fontSize: '0.9rem',
                              textDecoration: 'line-through',
                              color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}>
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span style={{
                              fontSize: '0.85rem',
                              color: '#388e3c',
                              fontWeight: '600'
                            }}>
                              {discount}% Off
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                          borderRadius: '6px',
                          padding: '4px'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'transparent',
                              color: isDarkMode ? '#f5f5f5' : '#111',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            minWidth: '30px',
                            textAlign: 'center',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: isDarkMode ? '#f5f5f5' : '#111'
                          }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'transparent',
                              color: isDarkMode ? '#f5f5f5' : '#111',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                            borderRadius: '6px',
                            color: isDarkMode ? '#f5f5f5' : '#111',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = '#ff4444';
                            e.target.style.color = '#ff4444';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
                            e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bill Details */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: isDarkMode ? '#f5f5f5' : '#111',
              marginBottom: '20px'
            }}>
              Bill Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
              }}>
                <span>Item Total</span>
                <span>₹{itemTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: '#388e3c',
                fontWeight: '600'
              }}>
                <span>Delivery Fee</span>
                <span>FREE</span>
              </div>
              {paymentMethod === 'COD' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.95rem',
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                }}>
                  <span>COD Charges</span>
                  <span>₹{codCharges}</span>
                </div>
              )}
              <div style={{
                height: '1px',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                margin: '16px 0'
              }}></div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                <span>Order Total:</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: isDarkMode ? '#f5f5f5' : '#111',
              marginBottom: '16px'
            }}>
              Payment Method
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: `2px solid ${paymentMethod === 'COD' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'COD' ? (isDarkMode ? 'rgba(255, 109, 46, 0.1)' : 'rgba(255, 109, 46, 0.05)') : 'transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('COD')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    marginBottom: '4px'
                  }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Pay ₹{codCharges} extra when you receive
                  </div>
                </div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: `2px solid ${paymentMethod === 'RAZORPAY' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'RAZORPAY' ? (isDarkMode ? 'rgba(255, 109, 46, 0.1)' : 'rgba(255, 109, 46, 0.05)') : 'transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('RAZORPAY')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    marginBottom: '4px'
                  }}>
                    Razorpay (Online Payment)
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Pay securely with cards, UPI, or wallets
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Continue to Payment / Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || isProcessingPayment || (!address && isAuthenticated && user)}
            style={{
              width: '100%',
              padding: '16px',
              background: (!address && isAuthenticated && user) ? '#ccc' : '#ff6d2e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (isPlacingOrder || isProcessingPayment || (!address && isAuthenticated && user)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: (isPlacingOrder || isProcessingPayment || (!address && isAuthenticated && user)) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isPlacingOrder && !isProcessingPayment && address) {
                e.target.style.background = '#e55a1f';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 46, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlacingOrder && !isProcessingPayment && address) {
                e.target.style.background = '#ff6d2e';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isProcessingPayment
              ? 'Processing Payment...'
              : isPlacingOrder
                ? 'Placing Order...'
                : (!address && isAuthenticated && user)
                  ? 'Please Select Address First'
                  : paymentMethod === 'RAZORPAY'
                    ? 'Pay & Place Order'
                    : 'Continue to Payment'}
          </button>

          {error && (
            <div style={{
              padding: '16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '0.9rem',
              marginTop: '16px',
              lineHeight: '1.5'
            }}>
              <strong>Error:</strong> {error}
              <div style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                {error.includes('404') || error.includes('Not Found') ? (
                  <div>
                    <p>Possible issues:</p>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Backend server is not running on port 8080</li>
                      <li>API endpoint path is incorrect</li>
                      <li>Check browser console (F12) for more details</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
