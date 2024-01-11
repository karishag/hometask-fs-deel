import React, { useEffect, useState } from 'react';
import HelperService from '../services/HelperService';
import styled from 'styled-components';
import { Profile } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  margin: 200px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px;
  column-gap: 10px;
`;

const StyledSelect = styled.select`
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
`;

const StyledButton = styled.button`
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
`;

const DropdownComponent = ({
  options,
  selectedValue,
  setSelectedValue,
}: {
  options: Profile[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}) => {
  // Function to handle the change event when an option is selected
  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedValue(event?.target?.value);
  };

  return (
    <InputContainer>
      <label htmlFor='dropdown'>Choose one of the client profiles: </label>
      <StyledSelect
        id='dropdown'
        value={selectedValue}
        onChange={handleDropdownChange}
      >
        <option value='' disabled>
          Select an option
        </option>
        {options.map((option: Profile) => (
          <option value={option?.id}>
            {option?.firstName} {option?.lastName}
          </option>
        ))}
      </StyledSelect>
    </InputContainer>
  );
};

const Login = ({
  setLoggedInProfile,
}: {
  setLoggedInProfile: (profile: Profile) => void;
}) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Here we fetch profiles that are of client type
    HelperService.fetchProfiles('client')
      .then((response) => {
        setOptions(response || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogin = () => {
    const loggedInProfileData =
      options.find((o: Profile) => o?.id.toString() === selectedValue) || null;
    setLoggedInProfile(loggedInProfileData);
  };

  return (
    <Container>
      <DropdownComponent
        options={options}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      <StyledButton onClick={handleLogin}>Login</StyledButton>
    </Container>
  );
};

export default Login;
