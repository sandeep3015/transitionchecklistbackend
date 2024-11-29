const express = require('express');

const path = require('path');
const cors = require('cors');

const app = express()
app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

const checklistParameters = [
    {
      name: 'Valuation Fee Paid',
      check: (data) => data.isValuationFeePaid === true,
    },
    {
      name: 'UK Resident',
      check: (data) => data.isUkResident === true,
    },
    {
      name: 'Risk Rating Medium',
      check: (data) => data.riskRating === 'Medium',
    },
    {
      name: 'LTV Below 60%',
      check: (data) => {
        const ltv = (data.loanRequired / data.purchasePrice) * 100;
        return ltv < 60;
      },
    },
  ];

const fetchData = async () =>  {
    const API_URL = 'http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639'
    try {
        const response = await fetch(API_URL)
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Expected JSON, but got ${contentType}`);
        }
    } catch (err){
        console.log("Error", err)
        return null
    }
}

const evaluateChecklist = async () => {
    const data = await fetchData()
    if (!data) return [];

    return checklistParameters.map((check) => ({
        name: check.name,
        passed: check.check(data),
    }));
}

app.get('/api/checklist', async (req, res) => {
    const results = await evaluateChecklist();
    res.json(results);
  });

app.listen(3000, () => {
    console.log('Server is Running')
})

