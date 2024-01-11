import React, { useState } from 'react';
import Login from './Login';
import HomePage from './HomePage';
import { Profile } from '../types';

function App() {
  const [loggedInProfile, setLoggedInProfile] = useState<Profile>(null);

  return (
    <div className='App'>
      {!loggedInProfile ? (
        <Login setLoggedInProfile={setLoggedInProfile} />
      ) : (
        <HomePage loggedInProfile={loggedInProfile} />
      )}
    </div>
  );
}

export default App;
