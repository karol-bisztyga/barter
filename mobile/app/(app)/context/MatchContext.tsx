import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { MatchData } from '../types';

export interface MatchContextState {
  matches: MatchData[];
  setMatches: React.Dispatch<React.SetStateAction<MatchData[]>>;
  currentMatchId: string | null;
  setCurrentMatchId: React.Dispatch<React.SetStateAction<string | null>>;
  unmatching: boolean;
  setUnmatching: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialState: MatchContextState = {
  matches: [],
  setMatches: () => {},
  currentMatchId: null,
  setCurrentMatchId: () => {},
  unmatching: false,
  setUnmatching: () => {},
};

export const MatchContext = createContext<MatchContextState | null>(initialState);

export const useMatchContext = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatchContext must be used within a MatchContextProvider');
  }
  return context;
};

export const MatchContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [unmatching, setUnmatching] = useState<boolean>(false);

  return (
    <MatchContext.Provider
      value={{
        matches,
        setMatches,
        currentMatchId,
        setCurrentMatchId,
        unmatching,
        setUnmatching,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
