const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const { Sequelize } = require('sequelize');
const app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, profile_id');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const { id: clientId } = req.profile;
    const contract = await Contract.findOne({ where: { id, ClientId: clientId } })
    if (!contract) return res.status(404).json({ error: 'No contract found for the given details' });
    res.json(contract)
})

app.get('/profiles', async (req, res) => {
    const { Profile } = req.app.get('models');
    const { type } = req.query;
    const profiles = await Profile.findAll({ where: { type: type } })

    if (!profiles) return res.status(404).json({ error: 'No profiles found' });
    res.status(200).json(profiles);
});

app.get('/client/contractors', getProfile, async (req, res) => {
    try {
        const { id: clientId } = req.profile;
        const { Profile, Contract } = req.app.get('models');

        const client = await Profile.findOne({
            where: { id: clientId, type: 'client' },
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Find all contractors associated with the client through contracts
        const contracts = await Contract.findAll({
            where: { ClientId: client.id },
        });

        const contractorIds = contracts.map(contract => contract.ContractorId);

        // Find the associated profiles of the contractors
        const contractors = await Profile.findAll({
            where: { id: contractorIds, type: 'contractor' },
        });

        res.status(200).json(contractors);
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    try {
        const { Profile, Contract, Job } = req.app.get('models');
        const { id: userId } = req.profile;

        const profile = await Profile.findByPk(userId);

        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        const activeContracts = await Contract.findAll({
            where: {
                [profile.type === 'client' ? 'clientId' : 'contractorId']: userId,
                status: 'in_progress',
            },
        });

        // Fetch all unpaid jobs for the user's active contracts
        const unpaidJobs = await Job.findAll({
            where: {
                contractId: activeContracts.map((contract) => contract.id),
                paid: false,
            },
        });

        return res.status(200).json(unpaidJobs);
    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error
        });
    }
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    let transaction;
    try {
        const jobId = req?.params?.job_id;
        const { id: clientId } = req.profile;
        const { Profile, Contract, Job } = req.app.get('models');

        // Start transaction
        transaction = await sequelize.transaction();

        // Find the job to pay
        const job = await Job.findByPk(jobId);

        if (!job) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.paid) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Job is already paid' });
        }

        const client = await Profile.findByPk(clientId);

        if (!client) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Client profile not found' });
        }

        if (client.balance < job.price) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Insufficient balance to pay for the job' });
        }

        const contract = await Contract.findByPk(job.ContractId);

        if (!contract) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Contract not found' });
        }

        await Profile.decrement('balance', {
            by: job.price,
            where: { id: clientId }, // Decrement client's balance
        });

        await Profile.increment('balance', {
            by: job.price,
            where: { id: contract.ContractorId }, // Increment contractor's balance
        });

        // Update the job's payment status with today's payment date
        await job.update({ paid: true, paymentDate: new Date() });

        // Commit the transaction
        await transaction.commit();

        return res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/jobs/all/:contractorId', getProfile, async (req, res) => {
    try {
        const contractorId = req.params.contractorId;
        const { id: clientId } = req.profile;
        const { Contract, Job } = req.app.get('models');

        // Fetch all contracts for the given contractor
        const contracts = await Contract.findAll({
            where: {
                contractorId,
                clientId,
            },
        });

        const contractIds = contracts.map((contract) => contract.id);

        const paidJobs = await Job.findAll({
            where: {
                contractId: contractIds,
                paid: true,
            },
        });

        const unpaidJobs = await Job.findAll({
            where: {
                contractId: contractIds,
                paid: false,
            },
        });

        return res.status(200).json({ paidJobs, unpaidJobs });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    let transaction;
    try {
        const userId = req?.params?.userId;
        const { amount } = req.body;
        const { Profile, Contract, Job } = req.app.get('models');

        // Start transaction
        transaction = await sequelize.transaction();

        const clientProfile = await Profile.findByPk(userId);

        if (!clientProfile) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Client not found' });
        }

        const contracts = await Contract.findAll({
            where: {
                clientId: userId,
            },
        });

        const totalJobsToPay = await Job.sum('price', {
            where: {
                ContractId: contracts.map((contract) => contract.id),
                paid: false,
            },
        });

        const maxDepositAmount = 0.25 * totalJobsToPay;

        if (amount > maxDepositAmount) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Deposit amount exceeds the allowed limit. Try with a smaller amount' });
        }

        await clientProfile.update({
            balance: (clientProfile.balance + amount).toFixed(2),
        });

        // Commit the transaction
        await transaction.commit();

        return res.status(200).json({ message: 'Deposit successful', newBalance: clientProfile.balance });
    } catch (error) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.error('Deposit failed:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/admin/best-profession', async (req, res) => {
    try {
        const { start, end } = req.query;
        const { Profile } = req.app.get('models');

        if (!start || !end) {
            return res.status(400).json({ error: 'Missing required parameters: start and end' });
        }

        const result = await Profile.findAll({
            attributes: [
                'id',
                'profession',
                [
                    Sequelize.literal(`
                  (SELECT SUM("ContractorContracts.Jobs"."price")
                  FROM "Contracts" AS "ContractorContracts"
                  INNER JOIN "Jobs" AS "ContractorContracts.Jobs"
                  ON "ContractorContracts"."id" = "ContractorContracts.Jobs"."ContractId"
                  WHERE "Profile"."id" = "ContractorContracts"."ContractorId"
                  AND "ContractorContracts.Jobs"."paymentDate" BETWEEN '${start}' AND '${end}')
                `),
                    'totalEarned',
                ],
            ],
            order: [[Sequelize.literal('totalEarned'), 'DESC']],
            limit: 1,
        });

        if (!result.length) {
            return res.status(404).json({ error: 'No data found for the specified time range' });
        }

        const bestProfession = result[0]?.profession;
        res.status(200).json({ bestProfession });
    } catch (error) {
        console.error('Error fetching best profession:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/admin/best-clients', async (req, res) => {
    try {
        const { start, end, limit = 2 } = req.query;
        // const { Profile, Job, Contract } = req.app.get('models');

        if (!start || !end) {
            return res.status(400).json({ error: 'Missing required parameters: start and end' });
        }

        const result = await sequelize.query(
            `
            SELECT
              "Profile"."id",
              "Profile"."firstName",
              "Profile"."lastName",
              SUM("ClientContracts.Jobs"."price") AS "totalPaid"
            FROM
              "Profiles" AS "Profile"
              INNER JOIN "Contracts" AS "ClientContracts" ON "Profile"."id" = "ClientContracts"."ClientId"
              INNER JOIN "Jobs" AS "ClientContracts.Jobs" ON "ClientContracts"."id" = "ClientContracts.Jobs"."ContractId"
            WHERE
              "ClientContracts.Jobs"."paymentDate" BETWEEN :start AND :end
            GROUP BY
              "Profile"."id", "Profile"."firstName", "Profile"."lastName"
            ORDER BY
              "totalPaid" DESC
            LIMIT :limit;
            `,
            {
                replacements: { start, end, limit: parseInt(limit, 10) },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!result.length) {
            return res.status(404).json({ error: 'No data found for the specified time range' });
        }

        const bestClients = result.map(client => ({
            id: client.id,
            fullName: client.firstName + ' ' + client.lastName,
            totalPaid: client.totalPaid,
        }));

        res.status(200).json({ bestClients });
    } catch (error) {
        console.error('Error fetching best clients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = app;
