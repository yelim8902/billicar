import { useMemo } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/kaia';
import RentalEscrowData from '../contracts/RentalEscrow.json';
import MockWKRWData from '../contracts/MockWKRW.json';
import VehicleNFTData from '../contracts/VehicleNFT.json';

export function useContract() {
  const getRentalEscrow = useMemo(() => async (withSigner = false) => {
    const provider = getProvider();
    const runner = withSigner ? await provider.getSigner() : provider;
    return new ethers.Contract(RentalEscrowData.address, RentalEscrowData.abi, runner);
  }, []);

  const getMockWKRW = useMemo(() => async (withSigner = false) => {
    const provider = getProvider();
    const runner = withSigner ? await provider.getSigner() : provider;
    return new ethers.Contract(MockWKRWData.address, MockWKRWData.abi, runner);
  }, []);

  const getVehicleNFT = useMemo(() => async (withSigner = false) => {
    const provider = getProvider();
    const runner = withSigner ? await provider.getSigner() : provider;
    return new ethers.Contract(VehicleNFTData.address, VehicleNFTData.abi, runner);
  }, []);

  return { getRentalEscrow, getMockWKRW, getVehicleNFT };
}
