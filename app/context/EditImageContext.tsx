import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { EditImagePurpose, EditImageType } from '../types';

interface EditImageContextState {
  imageType: EditImageType | null;
  setImageType: React.Dispatch<React.SetStateAction<EditImageType | null>>;
  itemId: string | null;
  setItemId: React.Dispatch<React.SetStateAction<string | null>>;
  purpose: EditImagePurpose | null;
  setPurpose: React.Dispatch<React.SetStateAction<EditImagePurpose | null>>;
  previousImage: string | null;
  setPreviousImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const initialState: EditImageContextState = {
  imageType: null,
  setImageType: () => {},
  itemId: null,
  setItemId: () => {},
  purpose: null,
  setPurpose: () => {},
  previousImage: null,
  setPreviousImage: () => {},
};

export const EditImageContext = createContext<EditImageContextState | null>(initialState);

export const useEditImageContext = () => {
  const context = useContext(EditImageContext);
  if (!context) {
    throw new Error('useEditImageContext must be used within a EditImageContextProvider');
  }
  return context;
};

export const EditImageContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [imageType, setImageType] = useState<EditImageType | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<EditImagePurpose | null>(null);
  const [previousImage, setPreviousImage] = useState<string | null>(null);

  return (
    <EditImageContext.Provider
      value={{
        imageType,
        setImageType,
        itemId,
        setItemId,
        purpose,
        setPurpose,
        previousImage,
        setPreviousImage,
      }}
    >
      {children}
    </EditImageContext.Provider>
  );
};
