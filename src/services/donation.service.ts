import { get, post, put, del } from './api';
import { Donation, ApiResponse } from '../types';

// Get all donations (admin only)
export const getAllDonations = async (): Promise<ApiResponse<Donation[]>> => {
  return await get<Donation[]>('/donations');
};

// Get user's donations
export const getUserDonations = async (): Promise<ApiResponse<Donation[]>> => {
  return await get<Donation[]>('/donations/my-donations');
};

// Get donation by ID
export const getDonationById = async (id: string): Promise<ApiResponse<Donation>> => {
  return await get<Donation>(`/donations/${id}`);
};

// Create new donation
export const createDonation = async (donationData: Partial<Donation>): Promise<ApiResponse<Donation>> => {
  return await post<Donation>('/donations', donationData);
};

// Update donation (admin only)
export const updateDonation = async (id: string, donationData: Partial<Donation>): Promise<ApiResponse<Donation>> => {
  return await put<Donation>(`/donations/${id}`, donationData);
};

// Delete donation (admin only)
export const deleteDonation = async (id: string): Promise<ApiResponse<void>> => {
  return await del<void>(`/donations/${id}`);
};
