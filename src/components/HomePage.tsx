import React, { useState, useEffect } from 'react';
import HelperService from '../services/HelperService';
import JobSection from './JobSection';
import styled from 'styled-components';
import { Profile } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  margin: 50px;
`;

const Balance = styled.p`
  font-size: 18px;
`;

const DepositContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 10px;
  margin: 30px;
`;

const StyledButton = styled.button`
  margin-bottom: 10px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  margin-bottom: 20px;

  input {
    padding: 5px 10px;
    font-size: 14px;
    cursor: pointer;
  }
`;

const HomePage = ({ loggedInProfile }: { loggedInProfile: Profile }) => {
  const [balance, setBalance] = useState<number>(loggedInProfile?.balance || 0);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<Profile>(null);

  useEffect(() => {
    // Update the 'autocompleteOptions' state with the fetched data
    HelperService.fetchClientContractors(loggedInProfile?.id)
      .then((response) => {
        setAutocompleteOptions(response || []);
      })
      .catch((err) => console.error(err));
  }, [loggedInProfile]);

  const handleDeposit = (amount: number) => {
    // deposit money in wallet
    HelperService.depositAmountInWallet(amount, loggedInProfile?.id)
      .then((response) => {
        setBalance(response.newBalance);
      })
      .catch((errResponse) => {
        errResponse.json().then((res: { error: Error }) => {
          alert(res.error);
        });
      });
  };

  const handleContinue = () => {
    const selectedContractor: Profile =
      autocompleteOptions.find(
        (option: Profile) =>
          `${option?.firstName} ${option?.lastName}` === inputValue
      ) || null;

    setSelectedContractor(selectedContractor);
  };

  return (
    <Container>
      <h2>
        Welcome {loggedInProfile?.firstName} {loggedInProfile?.lastName} 👋
      </h2>
      <Balance>Balance: ${balance}</Balance>
      <DepositContainer>
        {[1, 5, 10, 50, 100, 500].map((amount) => (
          <StyledButton key={amount} onClick={() => handleDeposit(amount)}>
            Deposit ${amount}
          </StyledButton>
        ))}
      </DepositContainer>
      {!selectedContractor ? (
        <InputContainer>
          <StyledDiv>
            <label>Pay Jobs for: </label>
            <input
              type='text'
              list='contractors'
              placeholder='Your contractor'
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <datalist id='contractors'>
              {autocompleteOptions.map((option: Profile) => (
                <option key={option?.id}>
                  {`${option?.firstName} ${option?.lastName}`}
                </option>
              ))}
            </datalist>
          </StyledDiv>
          <StyledButton onClick={handleContinue}>Continue</StyledButton>
        </InputContainer>
      ) : (
        <JobSection
          loggedInProfile={loggedInProfile}
          selectedContractor={selectedContractor}
          setSelectedContractor={setSelectedContractor}
          setBalance={setBalance}
        />
      )}
    </Container>
  );
};

export default HomePage;
