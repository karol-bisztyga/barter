import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { EditImageType } from '../types';

interface EditItemContextState {
  imageType: EditImageType | null;
  setImageType: React.Dispatch<React.SetStateAction<EditImageType | null>>;
  itemId: string | null;
  setItemId: React.Dispatch<React.SetStateAction<string | null>>;
  tempImage: string | null;
  setTempImage: React.Dispatch<React.SetStateAction<string | null>>;
  edited: boolean;
  setEdited: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialState: EditItemContextState = {
  imageType: null,
  setImageType: () => {},
  itemId: null,
  setItemId: () => {},
  tempImage: null,
  setTempImage: () => {},
  edited: false,
  setEdited: () => {},
};

export const EditItemContext = createContext<EditItemContextState | null>(initialState);

export const useEditItemContext = () => {
  const context = useContext(EditItemContext);
  if (!context) {
    throw new Error('useEditItemContext must be used within a EditItemContextProvider');
  }
  return context;
};

export const EditItemContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [imageType, setImageType] = useState<EditImageType | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [edited, setEdited] = useState<boolean>(false);

  return (
    <EditItemContext.Provider
      value={{
        imageType,
        setImageType,
        itemId,
        setItemId,
        tempImage,
        setTempImage,
        edited,
        setEdited,
      }}
    >
      {children}
    </EditItemContext.Provider>
  );
};
