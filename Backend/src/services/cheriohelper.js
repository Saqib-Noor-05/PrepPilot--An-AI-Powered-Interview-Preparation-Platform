const { extractVisibleContent } = require('./testcherio');

async function run() {
    const result = await extractVisibleContent('https://www.salesforce.com/company/careers/jobs/JR338691/deal-strategy-and-pricing-manager/');
    console.log(result.text);        // the clean, readable job description
    console.log(result.diagnostics); // confidence score + word count etc.
}
run();