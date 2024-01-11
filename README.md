### To run the project execute the following commands at the root directory

As suggested, make sure we're using the LTS version of Node ~ v20.10.0

1. npm install
2. npm run seed
3. npm run start

- The client is running on port 3000.
- The server is running on port 3001.

## Things added

1. This code base contains both FE and BE implementation where using Typescript the client shows up a dashboard for client profile and can make payments to the contractor for unpaid jobs. The user is also able to see other important details like balance, and other contracts.
2. I've added all the APIs asked as per the app requirement and also added few more which I believe was required in retrieving data and display on dashboard for the client the user has access to
3. Made use of transactions supported by sequelize to concurrently run queries over table that needs locking over tables using row-level locking. Used in cases where updating of balance is required or any payment needs to be done etc.
4. Made use of Typescript over JS due to its statically-typed nature which makes it more safer and less error prone when productionized. A more better version of this would have been when it was object oriented too
5. For the ease in testing of APIs, I've creation a Postman collection as well that contains all the APIs implemented so far. It can be simply imported in Postman app.
   https://api.postman.com/collections/12322900-761c0cad-accf-4b72-8d8b-4e19d9f63dfa?access_key=PMAT-01HKX0TMY4TTNGDNADS0MXTK1T
6. Preferred and used Styled components over CSS stylesheets as it simplifies the styling process and no overhead of defining classnames again and again for each element.
7. Added eslint linting utility to improve code-readability, consistency enforce coding standards and patterns and identify bugs.

## What more can be improved ?

1. There can be better Error handling and Logging in the codebase in order to cover for all edge scenarios and also improving the UI with error states and loading states
2. Unit, Integration, E2E test cases for both FE and BE using RTL/Jest, Chai and mocha respectively. This will give more confidence on our system
3. UI can be improved a lot either by using libraries (mui) that would enhance UX and consistent, flexible UI
4. Codebase structure to be improved like using controller, services, components, containers, models, view etc. directory structure. Due to shortage of time couldn't pick this up, as I wanted to prioritize the functionality part first. And also adding js-docs for each function and component
5. The code can be deployed on Heroku/Vercel/Github and make use of the host url to call the set of APIs instead of localhost. But for now as part of this exercise we can be good

Thank You 🙏
