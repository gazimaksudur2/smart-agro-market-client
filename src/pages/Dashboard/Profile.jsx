import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaCheck } from 'react-icons/fa';
import Select from 'react-select';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser, accessToken, userRole } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  const location = useLocation();
  const queryClient = useQueryClient();
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Check if user is new (coming from registration)
  const isNewUser = location.state?.newUser || false;
  
  // Fetch user profile data
  const { data: userData, isLoading: profileLoading } = useQuery(
    ['userProfile', currentUser?.email],
    async () => {
      if (!currentUser?.email || !accessToken) return null;
      
      try {
        const { data } = await axios.get(`${apiBaseUrl}/users/${currentUser.email}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    {
      enabled: !!currentUser?.email && !!accessToken,
      onSuccess: (data) => {
        if (data) {
          // Set form values from fetched data
          setValue('name', data.name);
          setValue('phoneNumber', data.phoneNumber);
          setValue('street', data.address?.street);
          setValue('city', data.address?.city);
          setValue('state', data.address?.state);
          setValue('zip', data.address?.zip);
          
          // Set selected region/district if they exist
          if (data.region) {
            setSelectedRegion({ value: data.region, label: data.region });
          }
          
          if (data.district) {
            setSelectedDistrict({ value: data.district, label: data.district });
          }
          
          // If user is agent, set warehouse address
          if (userRole === 'agent') {
            setValue('warehouseAddress', data.warehouseAddress);
          }
        }
        
        // If new user, enable edit mode automatically
        if (isNewUser) {
          setIsEditing(true);
        }
      }
    }
  );

  // Fetch regions for the dropdown
  const { data: regions } = useQuery('regions', async () => {
    const { data } = await axios.get(`${apiBaseUrl}/regions`);
    return data;
  });

  // Update districts when region changes
  useEffect(() => {
    if (regions && selectedRegion) {
      const region = regions.find(r => r.name === selectedRegion.value);
      if (region) {
        setDistricts(region.districts);
      }
    }
  }, [selectedRegion, regions]);

  // Mutation for updating profile
  const updateProfile = useMutation(
    async (profileData) => {
      return axios.patch(`${apiBaseUrl}/users/${currentUser.email}`, profileData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userProfile', currentUser?.email]);
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
        setIsLoading(false);
      }
    }
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    const profileData = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: 'Bangladesh'
      }
    };
    
    // Add region/district if selected
    if (selectedRegion) {
      profileData.region = selectedRegion.value;
    }
    
    if (selectedDistrict) {
      profileData.district = selectedDistrict.value;
    }
    
    // Add warehouse address for agents
    if (userRole === 'agent') {
      profileData.warehouseAddress = data.warehouseAddress;
    }
    
    updateProfile.mutate(profileData);
  };

  // Region options for select
  const regionOptions = regions?.map(region => ({
    value: region.name,
    label: region.name
  })) || [];

  // District options for select
  const districtOptions = districts?.map(district => ({
    value: district.name,
    label: district.name
  })) || [];

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Profile header */}
          <div className="px-4 py-5 sm:px-6 bg-primary-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and information
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-outline flex items-center py-1.5"
              >
                <FaEdit className="mr-1" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {profileLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          className="form-input"
                          {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <p className="form-error">{errors.name.message}</p>}
                      </div>

                      {/* Email (readonly) */}
                      <div>
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          className="form-input bg-gray-100"
                          value={currentUser?.email || 'N/A'}
                          readOnly
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          className="form-input"
                          {...register('phoneNumber', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9+\-\s()]*$/,
                              message: 'Invalid phone number format'
                            }
                          })}
                          placeholder="+880 1XX XXX XXXX"
                        />
                        {errors.phoneNumber && <p className="form-error">{errors.phoneNumber.message}</p>}
                      </div>

                      {/* User Role (readonly) */}
                      <div>
                        <label htmlFor="role" className="form-label">User Role</label>
                        <input
                          id="role"
                          type="text"
                          className="form-input bg-gray-100 capitalize"
                          value={userRole || 'N/A'}
                          readOnly
                        />
                      </div>

                      {/* Region */}
                      <div>
                        <label className="form-label">Region/Division</label>
                        <Select
                          options={regionOptions}
                          value={selectedRegion}
                          onChange={(option) => {
                            setSelectedRegion(option);
                            setSelectedDistrict(null); // Reset district when region changes
                          }}
                          placeholder="Select Region/Division"
                          isClearable
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>

                      {/* District */}
                      <div>
                        <label className="form-label">District</label>
                        <Select
                          options={districtOptions}
                          value={selectedDistrict}
                          onChange={setSelectedDistrict}
                          placeholder={selectedRegion ? "Select District" : "Select Region First"}
                          isDisabled={!selectedRegion}
                          isClearable
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="street" className="form-label">Street Address</label>
                            <input
                              id="street"
                              type="text"
                              className="form-input"
                              {...register('street')}
                            />
                          </div>
                          <div>
                            <label htmlFor="city" className="form-label">City</label>
                            <input
                              id="city"
                              type="text"
                              className="form-input"
                              {...register('city')}
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="form-label">State/Province</label>
                            <input
                              id="state"
                              type="text"
                              className="form-input"
                              {...register('state')}
                            />
                          </div>
                          <div>
                            <label htmlFor="zip" className="form-label">Postal Code</label>
                            <input
                              id="zip"
                              type="text"
                              className="form-input"
                              {...register('zip')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warehouse Address for Agents */}
                      {userRole === 'agent' && (
                        <div className="md:col-span-2">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Warehouse Address</h4>
                          <textarea
                            id="warehouseAddress"
                            className="form-input"
                            rows="3"
                            {...register('warehouseAddress', { 
                              required: 'Warehouse address is required for agents' 
                            })}
                            placeholder="Enter complete warehouse address"
                          ></textarea>
                          {errors.warehouseAddress && <p className="form-error">{errors.warehouseAddress.message}</p>}
                        </div>
                      )}
                    </div>

                    {/* Form buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary flex items-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-1" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* User info */}
                      <div className="flex items-start">
                        <FaUser className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Name</p>
                          <p className="text-sm text-gray-500">{userData?.name || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaEnvelope className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">{currentUser?.email || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaPhone className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-500">{userData?.phoneNumber || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mt-1 h-5 w-5 flex items-center justify-center text-gray-400">
                          <span className="font-medium text-xs">ID</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">User Role</p>
                          <p className="text-sm text-gray-500 capitalize">{userRole || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaMapMarkerAlt className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Region</p>
                          <p className="text-sm text-gray-500">{userData?.region || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaMapMarkerAlt className="mt-1 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">District</p>
                          <p className="text-sm text-gray-500">{userData?.district || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Full Address</h4>
                      <p className="text-sm text-gray-500">
                        {userData?.address?.street ? (
                          <>
                            {userData.address.street}
                            {userData.address.city && `, ${userData.address.city}`}
                            {userData.address.state && `, ${userData.address.state}`}
                            {userData.address.zip && ` ${userData.address.zip}`}
                            {`, Bangladesh`}
                          </>
                        ) : (
                          'Address not specified'
                        )}
                      </p>
                    </div>

                    {/* Warehouse Address (for agents) */}
                    {userRole === 'agent' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Warehouse Address</h4>
                        <p className="text-sm text-gray-500">
                          {userData?.warehouseAddress || 'Not specified'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 