import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { EditImageType } from '../types';

interface EditImageContextState {
  imageType: EditImageType | null;
  setImageType: React.Dispatch<React.SetStateAction<EditImageType | null>>;
  itemId: string | null;
  setItemId: React.Dispatch<React.SetStateAction<string | null>>;
  tempImage: string | null;
  setTempImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const initialState: EditImageContextState = {
  imageType: null,
  setImageType: () => {},
  itemId: null,
  setItemId: () => {},
  tempImage: null,
  setTempImage: () => {},
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
  const [tempImage, setTempImage] = useState<string | null>(null);

  return (
    <EditImageContext.Provider
      value={{
        imageType,
        setImageType,
        itemId,
        setItemId,
        tempImage,
        setTempImage,
      }}
    >
      {children}
    </EditImageContext.Provider>
  );
};
