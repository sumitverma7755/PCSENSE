const { execFileSync } = require('child_process');

const TASK_NAME = process.env.PCSENSEI_DAILY_TASK_NAME || 'PCSensei-Daily-Price-Check';

function removeDailyTask() {
    if (process.platform !== 'win32') {
        throw new Error('Daily task removal is currently supported on Windows only.');
    }

    execFileSync(
        'schtasks',
        ['/Delete', '/F', '/TN', TASK_NAME],
        { stdio: 'inherit' }
    );

    console.log(`Daily task "${TASK_NAME}" removed.`);
}

try {
    removeDailyTask();
} catch (error) {
    console.error(`Failed to remove daily task: ${error.message}`);
    process.exit(1);
}
