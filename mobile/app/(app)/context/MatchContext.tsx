import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { MatchData } from '../types';

/**
 * so in the db there is `matches_updates::date_updated` which is a timestamp flag
 * every time any of the matches of a certain user is updated, this flag has to be updated
 *
 * we also store the flag here as localDateUpdated
 * every time the navigation goes to the chats tab, we check if the localDateUpdated is the same as the server's
 *    if it's null or different, we pull/re-pull the matches
 *    if it's the same we don't pull the matches
 */

export interface MatchContextState {
  matches: MatchData[];
  setMatches: React.Dispatch<React.SetStateAction<MatchData[]>>;
  currentMatchId: string | null;
  setCurrentMatchId: React.Dispatch<React.SetStateAction<string | null>>;
  localDateUpdated: string | null;
  setLocalDateUpdated: React.Dispatch<React.SetStateAction<string | null>>;
}

const initialState: MatchContextState = {
  matches: [],
  setMatches: () => {},
  currentMatchId: null,
  setCurrentMatchId: () => {},
  localDateUpdated: null,
  setLocalDateUpdated: () => {},
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
  const [localDateUpdated, setLocalDateUpdated] = useState<string | null>(null);

  return (
    <MatchContext.Provider
      value={{
        matches,
        setMatches,
        currentMatchId,
        setCurrentMatchId,
        localDateUpdated,
        setLocalDateUpdated,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
