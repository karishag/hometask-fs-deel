import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import HelperService from '../services/HelperService';
import styled from 'styled-components';
import { Profile } from '../types';

type Props = {
  loggedInProfile: Profile;
  selectedContractor: Profile | null;
  setSelectedContractor: (selectedContractor: Profile | null) => void;
  setBalance: Dispatch<SetStateAction<number>>;
};

type Job = {
  id: number;
  description: string;
  price: number;
  paid: boolean;
  paymentDate: number;
  createdAt: string;
  updatedAt: string;
  ContractId: number;
};

const PaidJobsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const JobsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const JobItem = styled.li`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledButton = styled.button`
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
`;

const JobSection = ({
  loggedInProfile,
  selectedContractor,
  setSelectedContractor,
  setBalance,
}: Props) => {
  const [paidJobs, setPaidJobs] = useState([]);
  const [unpaidJobs, setUnpaidJobs] = useState([]);

  const fetchJobs = () => {
    HelperService.findAllJobs(selectedContractor?.id, loggedInProfile?.id)
      .then((response) => {
        setPaidJobs(response.paidJobs);
        setUnpaidJobs(response.unpaidJobs);
      })
      .catch((errResponse) => {
        console.error(errResponse);
        errResponse.json().then((res: { error: Error }) => {
          alert(res.error);
        });
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedContractor]);

  const handlePayJob = (jobId: number, jobPrice: number) => {
    HelperService.makeJobPayment(jobId, loggedInProfile?.id)
      .then(() => {
        fetchJobs();
        setBalance((balance: number) =>
          Number((balance - jobPrice).toFixed(2))
        );
      })
      .catch((errResponse) => {
        console.error(errResponse);
        errResponse.json().then((res: { error: Error }) => {
          alert(res.error);
        });
      });
  };

  return (
    <>
      <StyledButton onClick={() => setSelectedContractor(null)}>
        {'← Back'}
      </StyledButton>
      <h3>
        Want to view contractual jobs for {selectedContractor?.firstName}{' '}
        {selectedContractor?.lastName} ? Here you go!
      </h3>
      {paidJobs.length > 0 && (
        <PaidJobsContainer>
          <h4>Paid Jobs</h4>
          <JobsList>
            {paidJobs.map((job: Job) => (
              <JobItem key={job?.id}>
                <div>Job Name: {job?.description}</div>
                <div>Price Paid: ${job.price}</div>
                <div>
                  Payment Date:{' '}
                  {new Date(job.paymentDate).toDateString() || 'Not available'}
                </div>
              </JobItem>
            ))}
          </JobsList>
        </PaidJobsContainer>
      )}
      {unpaidJobs.length > 0 && (
        <PaidJobsContainer>
          <h4>Unpaid Jobs</h4>
          <JobsList>
            {unpaidJobs.map((job: Job) => (
              <JobItem key={job.id}>
                <div>Job Name: {job.description}</div>
                <div>Price to be paid: ${job.price}</div>
                <StyledButton onClick={() => handlePayJob(job.id, job.price)}>
                  Pay full amount
                </StyledButton>
              </JobItem>
            ))}
          </JobsList>
        </PaidJobsContainer>
      )}
    </>
  );
};

export default JobSection;
