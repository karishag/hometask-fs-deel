const HelperService = {
  async fetchProfiles(type: 'client' | 'contractor') {
    const response = await fetch(
      `http://localhost:3001/profiles?type=${type}`,
      {
        method: 'GET',
      }
    );

    if (response.ok) {
      return response.json();
    }

    throw new Error('Fetch profile call failed');
  },

  async fetchClientContractors(clientId: number | undefined) {
    let requestHeaders: HeadersInit = new Headers();
    requestHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      profile_id: clientId?.toString() || '',
    };

    try {
      const response = await fetch(`http://localhost:3001/client/contractors`, {
        method: 'GET',
        headers: requestHeaders,
      });

      if (!response.ok) {
        return Promise.reject(response);
      }

      return response.json();
    } catch (err) {
      console.error(err);
      throw new Error('Internal server error');
    }
  },

  async depositAmountInWallet(amount: number, userId: number | undefined) {
    let requestHeaders: HeadersInit = new Headers();
    requestHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      profile_id: userId?.toString() || '',
    };

    try {
      const response = await fetch(
        `http://localhost:3001/balances/deposit/${userId}`,
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            amount,
          }),
        }
      );

      if (!response.ok) {
        return Promise.reject(response);
      }

      return response.json();
    } catch (err) {
      throw new Error('Internal server error');
    }
  },

  async findAllJobs(
    contractorId: number | undefined,
    clientId: number | undefined
  ) {
    let requestHeaders: HeadersInit = new Headers();
    requestHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      profile_id: clientId?.toString() || '',
    };

    try {
      const response = await fetch(
        `http://localhost:3001/jobs/all/${contractorId}`,
        {
          method: 'GET',
          headers: requestHeaders,
        }
      );

      if (!response.ok) {
        return Promise.reject(response);
      }

      return response.json();
    } catch (err) {
      console.error(err);
      throw new Error('Internal server error');
    }
  },

  async makeJobPayment(jobId: number, clientId: number | undefined) {
    let requestHeaders: HeadersInit = new Headers();
    requestHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      profile_id: clientId?.toString() || '',
    };

    try {
      const response = await fetch(`http://localhost:3001/jobs/${jobId}/pay`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          clientId,
        }),
      });

      if (!response.ok) {
        return Promise.reject(response);
      }

      return response.json();
    } catch (err) {
      throw new Error('Internal server error');
    }
  },
};

export default HelperService;
