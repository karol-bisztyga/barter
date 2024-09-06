import React, { createContext, useState, ReactNode, FC, useContext } from 'react';

interface AddPictureContextState {
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const initialState: AddPictureContextState = {
  image: null,
  setImage: () => {},
};

export const AddPictureContext = createContext<AddPictureContextState | null>(initialState);

export const useAddPictureContext = () => {
  const context = useContext(AddPictureContext);
  if (!context) {
    throw new Error('useAddPictureContext must be used within a AddPictureContextProvider');
  }
  return context;
};

export const AddPictureContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [image, setImage] = useState<string | null>(null);

  return (
    <AddPictureContext.Provider
      value={{
        image,
        setImage,
      }}
    >
      {children}
    </AddPictureContext.Provider>
  );
};
